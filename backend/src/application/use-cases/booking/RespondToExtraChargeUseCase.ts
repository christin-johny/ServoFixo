import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { RespondToExtraChargeDto } from "../../dto/booking/RespondToExtraChargeDto";
import { ErrorMessages, NotificationMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class RespondToExtraChargeUseCase implements IUseCase<void, [RespondToExtraChargeDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: RespondToExtraChargeDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
 
    if (booking.getCustomerId() !== input.customerId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }
    
    const previousStatus = booking.getStatus();
 
    booking.updateExtraChargeStatus(
        input.chargeId, 
        input.response === "APPROVE" ? "APPROVED" : "REJECTED",
        `customer:${input.customerId}`
    );
    booking.calculateFinalPrice(); 
    
    await this._bookingRepo.update(booking); 
 
    const newStatus = booking.getStatus();

    if (previousStatus !== newStatus) {
        await this._notificationService.send({
            recipientId: booking.getTechnicianId()!,
            recipientType: "TECHNICIAN",
            type: NotificationType.BOOKING_STATUS_UPDATE,
            title: NotificationMessages.TITLE_JOB_RESUMED,
            body: `${NotificationMessages.BODY_JOB_RESUMED}${newStatus}.`,
            metadata: { 
                bookingId: booking.getId(), 
                status: newStatus 
            }
        });

        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: NotificationType.BOOKING_STATUS_UPDATE,
            title: NotificationMessages.TITLE_STATUS_UPDATED,
            body: `${NotificationMessages.BODY_STATUS_UPDATED}${newStatus}`,
            metadata: { 
                bookingId: booking.getId(), 
                status: newStatus 
            }
        });
    }

    const charge = booking.getExtraCharges().find(c => c.id === input.chargeId);
    
    await this._notificationService.send({
        recipientId: booking.getTechnicianId()!,
        recipientType: "TECHNICIAN",
        type: NotificationType.CHARGE_UPDATE,
        title: input.response === "APPROVE" ? NotificationMessages.TITLE_CHARGE_APPROVED : NotificationMessages.TITLE_CHARGE_REJECTED,
        body: input.response === "APPROVE" 
            ? `${NotificationMessages.BODY_CHARGE_APPROVED_PREFIX}${charge?.title}${NotificationMessages.BODY_CHARGE_APPROVED_SUFFIX}` 
            : `${NotificationMessages.BODY_CHARGE_REJECTED_PREFIX}${charge?.title}${NotificationMessages.BODY_CHARGE_REJECTED_SUFFIX}`,
        metadata: { 
            bookingId: booking.getId(), 
            chargeId: input.chargeId,
            status: input.response 
        },
        clickAction: `/technician/bookings/${booking.getId()}`
    });

    await this._notificationService.send({
        recipientId: "ADMIN_BROADCAST_CHANNEL",
        recipientType: "ADMIN",
        type: "ADMIN_STATUS_UPDATE" as any,
        title: NotificationMessages.TITLE_CHARGE_DECISION_ADMIN,
        body: `${NotificationMessages.BODY_CHARGE_DECISION_ADMIN_PREFIX}${input.response}${NotificationMessages.BODY_CHARGE_DECISION_ADMIN_MIDDLE}${booking.getId().slice(-6)}`,
        metadata: { 
            bookingId: booking.getId(), 
            status: newStatus 
        }
    });

    this._logger.info(`${LogEvents.CHARGE_RESPONSE_LOG}: ${input.chargeId} ${input.response} for booking ${booking.getId()}`);
  }
}