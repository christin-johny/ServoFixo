import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { RespondToBookingDto } from "../../dto/booking/RespondToBookingDto";
import { ErrorMessages, NotificationMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Booking } from "../../../domain/entities/Booking";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

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
        this._logger.warn(`${LogEvents.BOOKING_LATE_RESPONSE} ${input.bookingId}`);
        throw new Error(ErrorMessages.BOOKING_ALREADY_ASSIGNED);
    }
 
    const currentAttempt = booking.getAttempts().find(a => a.status === "PENDING");
    if (!currentAttempt || currentAttempt.techId !== input.technicianId) {
        throw new Error(ErrorMessages.NOT_ACTIVE_CANDIDATE);
    }

    if (input.response === "ACCEPT") {
        await this.handleAcceptance(booking, input.technicianId);
    } else {
        await this.handleRejection(booking, input.technicianId, input.reason);
    }
  }

  private async handleAcceptance(booking: Booking, techId: string) {
    const tech = await this._technicianRepo.findById(techId);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);

    const techName = tech.getName ? tech.getName() : (tech as any).name;
    const techPhone = tech.getPhone ? tech.getPhone() : (tech as any).phone;
    
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

    const success = await this._bookingRepo.assignTechnician(
      booking.getId(), 
      techId, 
      techSnapshot
    );
    
    if (!success) {
        throw new Error(ErrorMessages.BOOKING_ALREADY_ASSIGNED); 
    }
 
    await this._technicianRepo.updateAvailabilityStatus(techId, true);

    const currentSnapshots = booking.getSnapshots();
    if (currentSnapshots) {
        Object.assign(currentSnapshots, { technician: techSnapshot });
    } else {
        (booking as any)._snapshots = { 
             ...((booking as any)._snapshots || {}),
             technician: techSnapshot 
        };
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    booking.acceptAssignment(techId); 
    if (booking.setOtp) {
        booking.setOtp(otp);
    } else {
        booking.getMeta().otp = otp;
    }

    await this._bookingRepo.update(booking);

    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: NotificationType.BOOKING_CONFIRMED, 
        title: NotificationMessages.TITLE_TECH_ASSIGNED_CUSTOMER,
        body: `${techSnapshot.name}${NotificationMessages.BODY_TECH_ON_THE_WAY}${otp}`,
        metadata: { 
            bookingId: booking.getId(), 
            techId: techId,
            techName: techSnapshot.name,
            techPhoto: techSnapshot.avatarUrl || "",
            otp: otp 
        },
        clickAction: `/customer/bookings/${booking.getId()}`
    });

    await this._notificationService.send({
        recipientId: techId,
        recipientType: "TECHNICIAN",
        type: NotificationType.BOOKING_CONFIRMED,
        title: NotificationMessages.TITLE_BOOKING_CONFIRMED_TECH,
        body: NotificationMessages.BODY_PROCEED_TO_LOCATION,
        metadata: { bookingId: booking.getId() },
        clickAction: `/technician/bookings/${booking.getId()}`
    });

    await this._notificationService.send({
        recipientId: "ADMIN_BROADCAST_CHANNEL",
        recipientType: "ADMIN",
        type: "ADMIN_STATUS_UPDATE" as any,  
        title: NotificationMessages.TITLE_TECH_ASSIGNED_ADMIN,
        body: `${techSnapshot.name}${NotificationMessages.BODY_TECH_ACCEPTED_BOOKING}${booking.getId().slice(-6)}`,
        metadata: { 
            bookingId: booking.getId(), 
            status: "ACCEPTED",
            technicianId: techId,
            techName: techSnapshot.name,
            techPhoto: techSnapshot.avatarUrl || ""
        }
    });

    this._logger.info(`${LogEvents.BOOKING_ACCEPTED_LOG} ${booking.getId()} by ${techId}`);
  }

  private async handleRejection(booking: Booking, techId: string, reason?: string) {
    booking.rejectAssignment(techId, reason || "Declined by Technician");

    const candidates = booking.getCandidateIds();
    const currentIndex = candidates.indexOf(techId);
    const nextCandidateId = candidates[currentIndex + 1];

    if (nextCandidateId) {
        booking.addAssignmentAttempt(nextCandidateId);
        await this._bookingRepo.update(booking); 

        const serviceName = booking.getSnapshots().service.name || "Service Request";
        const estimatedPrice = booking.getPricing().estimated;
        const earnings = Math.round((estimatedPrice * 0.9) * 100) / 100;

        await this._notificationService.sendBookingRequest(nextCandidateId, {
            bookingId: booking.getId(),
            serviceName: serviceName,
            earnings: earnings,
            distance: "Calculating...", 
            address: booking.getLocation().address,
            expiresAt: booking.getAssignmentExpiresAt()!
        });
        this._logger.info(`${LogEvents.BOOKING_REJECTED_LOG} ${booking.getId()} by ${techId}. Next -> ${nextCandidateId}`);
    } else {
        booking.updateStatus("FAILED_ASSIGNMENT", "system", "All candidates rejected");
        await this._bookingRepo.update(booking);
        
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: NotificationType.BOOKING_FAILED, 
            title: NotificationMessages.TITLE_BOOKING_FAILED,
            body: NotificationMessages.BODY_ALL_TECHS_BUSY,
            metadata: { bookingId: booking.getId() }
        });
        this._logger.warn(`${LogEvents.BOOKING_FAILED_NO_CANDIDATES} ID: ${booking.getId()}`);
    }
  }
}