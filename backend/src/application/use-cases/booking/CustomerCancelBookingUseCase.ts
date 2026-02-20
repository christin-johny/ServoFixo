import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository"; 
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { CancelBookingDto } from "../../dto/booking/CancelBookingDto";
import { ErrorMessages, NotificationMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class CustomerCancelBookingUseCase implements IUseCase<void, [CancelBookingDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: CancelBookingDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.getCustomerId() !== input.userId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const currentStatus = booking.getStatus();

    if (['REACHED', 'IN_PROGRESS', 'EXTRAS_PENDING', 'COMPLETED', 'PAID', 'CANCELLED'].includes(currentStatus)) {
        throw new Error(ErrorMessages.CANCELLATION_NOT_ALLOWED);
    }

    if (currentStatus === "ASSIGNED_PENDING") {
        const pendingAttempt = booking.getAttempts().find(a => a.status === "PENDING");
        
        if (pendingAttempt) {
            await this._notificationService.send({
                recipientId: pendingAttempt.techId,
                recipientType: "TECHNICIAN",
                type: NotificationType.BOOKING_CANCELLED, 
                title: NotificationMessages.TITLE_REQUEST_WITHDRAWN,
                body: NotificationMessages.BODY_REQUEST_WITHDRAWN,
                metadata: { bookingId: booking.getId() }
            });
        }
    }

    const assignedTechId = booking.getTechnicianId();
    
    booking.updateStatus("CANCELLED", `customer:${input.userId}`, input.reason);
    await this._bookingRepo.update(booking);

    if (assignedTechId) {
        await this._technicianRepo.updateAvailabilityStatus(assignedTechId, false);

        await this._notificationService.send({
            recipientId: assignedTechId,
            recipientType: "TECHNICIAN",
            type: NotificationType.BOOKING_CANCELLED,
            title: NotificationMessages.TITLE_JOB_CANCELLED,
            body: NotificationMessages.BODY_JOB_CANCELLED_TECH,
            metadata: { bookingId: booking.getId() }
        });
    }

    await this._notificationService.send({
        recipientId: "ADMIN_BROADCAST_CHANNEL",
        recipientType: "ADMIN",
        type: "ADMIN_STATUS_UPDATE" as any,
        title: NotificationMessages.TITLE_BOOKING_CANCELLED_ADMIN,
        body: `${NotificationMessages.BODY_BOOKING_CANCELLED_ADMIN_PREFIX}${booking.getId().slice(-6)}`,
        metadata: { 
            bookingId: booking.getId(), 
            status: "CANCELLED" 
        }
    });

  }
}