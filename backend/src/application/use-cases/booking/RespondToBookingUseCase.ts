import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { RespondToBookingDto } from "../../dto/booking/RespondToBookingDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Booking } from "../../../domain/entities/Booking";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";

export class RespondToBookingUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: RespondToBookingDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
 
    if (booking.getStatus() !== "ASSIGNED_PENDING") {
        this._logger.warn(`Late response attempt for booking ${input.bookingId}`);
        throw new Error(ErrorMessages.BOOKING_ALREADY_ASSIGNED);
    }
 
    const currentAttempt = booking.getAttempts().find(a => a.status === "PENDING");
    if (!currentAttempt || currentAttempt.techId !== input.technicianId) {
        throw new Error("You are not the active candidate for this booking.");
    }

if (input.response === "ACCEPT") {
        // 1. Generate OTP (4 Digits)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 2. Accept Assignment (Domain Logic)
        booking.acceptAssignment(input.technicianId);
        
        // 3. Save OTP to Booking (Add this method to Booking entity or set meta directly)
        // assuming you added setOtp or access meta directly:
        const currentMeta = booking.getMeta();
        currentMeta.otp = otp; 
        // Or if you added the setter: booking.setOtp(otp);

        // 4. Persist
        await this._bookingRepo.update(booking);
        await this._technicianRepo.updateAvailabilityStatus(input.technicianId, true);

        // 5. Notify Customer (Include OTP)
        const tech = await this._technicianRepo .findById(input.technicianId);
        
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: "BOOKING_CONFIRMED" as any,
            title: "Technician Assigned! ✅",
            body: `${tech?.getName() || "Technician"} is assigned. OTP: ${otp}`,
            metadata: { 
                bookingId: booking.getId(),
                otp: otp // Sending it in metadata helps the frontend display it clearly
            },
            clickAction: `/customer/bookings/${booking.getId()}`
        });   
        await this.handleAcceptance(booking, input.technicianId);
    } else {
        await this.handleRejection(booking, input.technicianId, input.reason);
    }
  }

  // --- SCENARIO 2A: TECHNICIAN ACCEPTS (Flow A) ---
  private async handleAcceptance(booking: Booking, techId: string) {
    // 1. Fetch Tech Data for Snapshot
    const tech = await this._technicianRepo.findById(techId);
    if (!tech) throw new Error("Technician not found");

    // 2. Prepare Snapshot Data
    // We safely call the methods to avoid "Function is not assignable to string" errors.
    const techName = tech.getName ? tech.getName() : (tech as any).name;
    const techPhone = tech.getPhone ? tech.getPhone() : (tech as any).phone;
    
    // Fix: Explicitly call the function if it's a method, or access property
    let techAvatar: string | undefined;
    if (typeof (tech as any).getAvatarUrl === 'function') {
        techAvatar = (tech as any).getAvatarUrl();
    } else if (typeof (tech as any).getProfile === 'function') {
        techAvatar = (tech as any).getProfile()?.avatar;
    } else {
        techAvatar = (tech as any).avatarUrl;
    }

    const techSnapshot = {
      name: techName,
      phone: techPhone,
      avatarUrl: techAvatar,
      rating: tech.getRatings().averageRating || 0
    };

    // 3. ATOMIC LOCK with Snapshot
    const success = await this._bookingRepo.assignTechnician(
      booking.getId(), 
      techId, 
      techSnapshot
    );
    
    if (!success) {
        throw new Error(ErrorMessages.BOOKING_ALREADY_ASSIGNED); 
    }

    // 4. Notify Customer (The "Technician Assigned" Screen)
    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: NotificationType.BOOKING_CONFIRMED, 
        title: "Technician Assigned! 🎉",
        body: `${techSnapshot.name} is on the way.`,
        metadata: { 
            bookingId: booking.getId(), 
            techId: techId,
            techName: techSnapshot.name,
            techPhoto: techSnapshot.avatarUrl || ""
        },
        clickAction: `/customer/bookings/${booking.getId()}`
    });

    // 5. Notify Technician (Confirmation)
    await this._notificationService.send({
        recipientId: techId,
        recipientType: "TECHNICIAN",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Booking Confirmed ✅",
        body: "Please proceed to the location.",
        metadata: { bookingId: booking.getId() },
        clickAction: `/technician/bookings/${booking.getId()}`
    });

    this._logger.info(`Booking ${booking.getId()} ACCEPTED by ${techId}`);
  }

  // --- SCENARIO 2B: TECHNICIAN REJECTS (Flow B - The Loop) ---
// --- SCENARIO 2B: TECHNICIAN REJECTS (Flow B - The Loop) ---
  private async handleRejection(booking: Booking, techId: string, reason?: string) {
    // 1. Mark current attempt as REJECTED (Domain Logic)
    // This updates the status of the 'techId' attempt in the entity's memory
    booking.rejectAssignment(techId, reason || "Declined by Technician");

    // 2. Find Next Candidate
    const candidates = booking.getCandidateIds();
    const currentIndex = candidates.indexOf(techId);
    const nextCandidateId = candidates[currentIndex + 1];

    if (nextCandidateId) {
        // --- RETRY LOGIC (Next Candidate) ---
        
        // A. Add the new attempt to the Entity
        booking.addAssignmentAttempt(nextCandidateId);
        
        // B. Persist the ENTIRE change (Tech A = Rejected, Tech B = Pending)
        // CRITICAL FIX: Use .update() instead of .addAssignmentAttempt() 
        await this._bookingRepo.update(booking); 

        // Use service name from snapshot if available
        const serviceName = booking.getSnapshots().service.name || "Service Request";

        // Calculate Earnings: 90% of Estimate (10% Fee) + Rounding
        const estimatedPrice = booking.getPricing().estimated;
        const earnings = Math.round((estimatedPrice * 0.9) * 100) / 100;

        // C. Trigger Socket for NEXT Tech
        // Note: For 'distance', ideally you should recalculate it here using the new tech's location
        // But "Calculating..." is fine for MVP.
        await this._notificationService.sendBookingRequest(nextCandidateId, {
            bookingId: booking.getId(),
            serviceName: serviceName,
            earnings: earnings,
            distance: "Calculating...", 
            address: booking.getLocation().address,
            expiresAt: booking.getAssignmentExpiresAt()!
        });

        this._logger.info(`Booking ${booking.getId()} REJECTED by ${techId}. Next -> ${nextCandidateId}`);

    } else {
        // --- FAILURE LOGIC (No candidates left) ---
        
        // 1. Update Domain State
        booking.updateStatus("FAILED_ASSIGNMENT", "system", "All candidates rejected");
        
        // 2. Persist to DB
        await this._bookingRepo.update(booking);
        
        // 3. Notify Customer
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: "BOOKING_FAILED" as any, 
            title: "Booking Failed 😔",
            body: "Sorry, all technicians are currently busy. Please try again later.",
            metadata: { bookingId: booking.getId() }
        });
        
        // 4. Notify Admin (Optional but recommended)
        await this._notificationService.send({
             recipientId: "ADMIN_BROADCAST_CHANNEL",
             recipientType: "ADMIN",
             type: "ADMIN_BOOKING_FAILED" as any,
             title: "Booking Failed",
             body: `Booking ${booking.getId()} failed. All techs rejected.`,
             metadata: { bookingId: booking.getId() }
        });

        this._logger.warn(`Booking ${booking.getId()} FAILED. Candidates exhausted.`);
    }
  }
}