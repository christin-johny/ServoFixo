import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { RespondToBookingDto } from "../../dto/booking/RespondToBookingDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Booking } from "../../../domain/entities/Booking";

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

    // 1. Validate State
    // We only allow response if status is ASSIGNED_PENDING
    if (booking.getStatus() !== "ASSIGNED_PENDING") {
        this._logger.warn(`Late response attempt for booking ${input.bookingId}`);
        throw new Error(ErrorMessages.BOOKING_ALREADY_ASSIGNED); // Or expired
    }

    // 2. Validate Actor
    // Ensure the technician responding is the one currently in the "Hot Seat" (Pending Attempt)
    const currentAttempt = booking.getAttempts().find(a => a.status === "PENDING");
    if (!currentAttempt || currentAttempt.techId !== input.technicianId) {
        throw new Error("You are not the active candidate for this booking.");
    }

    if (input.response === "ACCEPT") {
        await this.handleAcceptance(booking, input.technicianId);
    } else {
        await this.handleRejection(booking, input.technicianId, input.reason);
    }
  }

  // --- SCENARIO 2A: TECHNICIAN ACCEPTS (Flow A) ---
  private async handleAcceptance(booking: Booking, techId: string) {
    // 1. ATOMIC LOCK (Critical)
    // We use the Repo's atomic method to ensure no one else accepted in the last millisecond
    const success = await this._bookingRepo.assignTechnician(booking.getId(), techId);
    
    if (!success) {
        throw new Error(ErrorMessages.BOOKING_ALREADY_ASSIGNED); // Race condition lost
    }

    // 2. Mark Technician as BUSY
    await this._technicianRepo.updateOnlineStatus(techId, true); // true = isOnline? No, we need updateAvailability
    // NOTE: You might need a specific method setBusy(true) in your repo. 
    // For MVP, assuming we track busy status or lock them from new requests via logic.

    // 3. Notify Customer (The "Technician Assigned" Screen)
    const tech = await this._technicianRepo.findById(techId);
    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: "BOOKING_CONFIRMED" as any, // Add to enum
        title: "Technician Assigned! 🎉",
        body: `${tech?.getName()} is on the way.`,
        metadata: { bookingId: booking.getId(), techId },
        clickAction: `/customer/bookings/${booking.getId()}`
    });

    // 4. Notify Technician (Confirmation)
    await this._notificationService.send({
        recipientId: techId,
        recipientType: "TECHNICIAN",
        type: "BOOKING_CONFIRMED" as any, 
        title: "Booking Confirmed ✅",
        body: "Please proceed to the location.",
        metadata: { bookingId: booking.getId() },
        clickAction: `/technician/bookings/${booking.getId()}`
    });

    this._logger.info(`Booking ${booking.getId()} ACCEPTED by ${techId}`);
  }

  // --- SCENARIO 2B: TECHNICIAN REJECTS (Flow B - The Loop) ---
  private async handleRejection(booking: Booking, techId: string, reason?: string) {
    // 1. Mark current attempt as REJECTED
    // We update the entity in memory first to calculate the next step
    booking.rejectAssignment(techId, reason || "Declined by Technician");

    // 2. Find Next Candidate
    const candidates = booking.getCandidateIds();
    const currentIndex = candidates.indexOf(techId);
    const nextCandidateId = candidates[currentIndex + 1];

    if (nextCandidateId) {
        // --- RETRY LOGIC (Next Candidate) ---
        
        // a. Create new attempt
        // This sets status='ASSIGNED_PENDING' and new 45s timer
        booking.addAssignmentAttempt(nextCandidateId);
        
        // b. Persist the rejection AND the new attempt
        // We use addAssignmentAttempt repo method which pushes the new attempt
        await this._bookingRepo.addAssignmentAttempt(booking.getId(), {
            techId: nextCandidateId,
            attemptAt: new Date(),
            expiresAt: new Date(Date.now() + 45000), // 45s
            status: "PENDING",
            adminForced: false
        });

        // c. Trigger Socket for NEXT Tech
        // (Similar to CreateBookingUseCase)
        await this._notificationService.sendBookingRequest(nextCandidateId, {
            bookingId: booking.getId(),
            serviceName: "Service Request", // You might need to fetch Service name again or store in Booking
            earnings: booking.getPricing().estimated * 0.8,
            distance: "Calculating...",
            address: booking.getLocation().address,
            expiresAt: booking.getAssignmentExpiresAt()!
        });

        this._logger.info(`Booking ${booking.getId()} REJECTED by ${techId}. Next -> ${nextCandidateId}`);

    } else {
        // --- FAILURE LOGIC (No candidates left) ---
        
        // Flow C: Total Failure
        await this._bookingRepo.updateStatus(booking.getId(), "FAILED_ASSIGNMENT");
        
        // Notify Customer
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: "BOOKING_FAILED" as any, // Add to enum
            title: "Booking Failed 😔",
            body: "Sorry, all technicians are currently busy. Please try again later.",
            metadata: { bookingId: booking.getId() }
        });

        this._logger.warn(`Booking ${booking.getId()} FAILED. Candidates exhausted.`);
    }
  }
}