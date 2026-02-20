import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { CancelBookingDto } from "../../dto/booking/CancelBookingDto";
import { ErrorMessages, NotificationMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";

export class TechnicianCancelBookingUseCase implements IUseCase<void, [CancelBookingDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: CancelBookingDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
    if (booking.getTechnicianId() !== input.userId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }


    await this._technicianRepo.updateAvailabilityStatus(input.userId, false);   
    try {
        booking.rejectAssignment(input.userId, ErrorMessages.PREFIX_CANCELLED_BY_TECH + input.reason);
    } catch (e) { 
        this._logger.error(`${LogEvents.TECH_CANCEL_REJECT_FAILED}: ${e}`);
        booking.setTechnicianId(null); 
    }
 
    const candidates = booking.getCandidateIds() || [];  
    const currentIndex = candidates.indexOf(input.userId);
    const nextCandidateId = candidates[currentIndex + 1];

    if (nextCandidateId) { 
        const newExpiresAt = new Date(Date.now() + 45000);
          
        booking.addAssignmentAttempt(nextCandidateId); 
          
        await this._bookingRepo.update(booking);

        const pricing = booking.getPricing();
        const earnings = pricing ? pricing.estimated : 0;  
 
        await this._notificationService.sendBookingRequest(nextCandidateId, {
            bookingId: booking.getId(),
            serviceName: booking.getSnapshots()?.service?.name || "Service",
            earnings: earnings,
            distance: "Check Map",
            address: booking.getLocation().address, 
            expiresAt: newExpiresAt 
        });
 
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: "BOOKING_UPDATE" as any,
            title: NotificationMessages.TITLE_TECH_CHANGED,
            body: NotificationMessages.BODY_TECH_EMERGENCY_REASSIGN,
            metadata: { bookingId: booking.getId() }
        });


    } else { 
        booking.updateStatus("FAILED_ASSIGNMENT", "system", ErrorMessages.REASON_TECH_CANCELLED_NO_REPLACEMENT);
        await this._bookingRepo.update(booking);

        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: NotificationType.BOOKING_FAILED,
            title: NotificationMessages.TITLE_BOOKING_FAILED,
            body: NotificationMessages.BODY_TECH_CANCEL_NO_CANDIDATES,
            metadata: { bookingId: booking.getId() }
        });
        await this._notificationService.send({
            recipientId: "ADMIN_BROADCAST_CHANNEL",
            recipientType: "ADMIN",
            type: "ADMIN_STATUS_UPDATE" as any,
            title: NotificationMessages.TITLE_TECH_CANCELLED_ADMIN,
            body: `${NotificationMessages.BODY_TECH_CANCELLED_ADMIN_PREFIX}${input.userId}${NotificationMessages.BODY_TECH_CANCELLED_ADMIN_SUFFIX}`,
            metadata: { 
                bookingId: booking.getId(), 
                status: booking.getStatus() 
            }
        });

        this._logger.warn(`${LogEvents.TECH_CANCEL_NO_CANDIDATES} ${booking.getId()}`);
    }
  }
}