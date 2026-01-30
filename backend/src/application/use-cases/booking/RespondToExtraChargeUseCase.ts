import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { RespondToExtraChargeDto } from "../../dto/booking/RespondToExtraChargeDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";
import { console } from "inspector";

export class RespondToExtraChargeUseCase implements IUseCase<void, [RespondToExtraChargeDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: RespondToExtraChargeDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
  console.log(input)
    if (booking.getCustomerId() !== input.customerId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }
    // 1. Capture status BEFORE update
    const previousStatus = booking.getStatus();
 
    // 2. Update Domain State (Approve/Reject & Recalculate)
    booking.updateExtraChargeStatus(
        input.chargeId, 
        input.response === "APPROVE" ? "APPROVED" : "REJECTED",
        `customer:${input.customerId}`
    );
    booking.calculateFinalPrice(); 
    
    // 3. Persist Changes
    await this._bookingRepo.update(booking); 
 
    // 4. Capture status AFTER update (Did it go back to IN_PROGRESS?)
    const newStatus = booking.getStatus();

    // 5. ✅ REALTIME SYNC: Broadcast Status Change
    if (previousStatus !== newStatus) {
        // Notify Technician (e.g. unlocks the "Waiting for Customer" screen)
        await this._notificationService.send({
            recipientId: booking.getTechnicianId()!,
            recipientType: "TECHNICIAN",
            type: NotificationType.BOOKING_STATUS_UPDATE,
            title: "Job Resumed 🚀",
            body: `Customer responded. Status is now ${newStatus}.`,
            metadata: { 
                bookingId: booking.getId(), 
                status: newStatus 
            }
        });

        // Notify Customer (Syncs stepper if they have multiple tabs open)
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: NotificationType.BOOKING_STATUS_UPDATE,
            title: "Status Updated",
            body: `Booking status is now ${newStatus}`,
            metadata: { 
                bookingId: booking.getId(), 
                status: newStatus 
            }
        });
    }

    // 6. ✅ NOTIFY RESULT: Tell Technician explicitly about the charge decision
    const charge = booking.getExtraCharges().find(c => c.id === input.chargeId);
    
    await this._notificationService.send({
        recipientId: booking.getTechnicianId()!,
        recipientType: "TECHNICIAN",
        type: NotificationType.CHARGE_UPDATE,
        title: input.response === "APPROVE" ? "Charge Approved ✅" : "Charge Rejected ❌",
        body: input.response === "APPROVE" 
            ? `Customer approved ${charge?.title}. You can continue.` 
            : `Customer rejected ${charge?.title}. Discuss or skip.`,
        metadata: { 
            bookingId: booking.getId(), 
            chargeId: input.chargeId,
            status: input.response 
        },
        clickAction: `/technician/bookings/${booking.getId()}`
    });

    this._logger.info(`Charge ${input.chargeId} ${input.response} for booking ${booking.getId()}`);
  }
}