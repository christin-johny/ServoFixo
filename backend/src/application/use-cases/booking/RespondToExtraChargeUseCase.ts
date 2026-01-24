import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { RespondToExtraChargeDto } from "../../dto/booking/RespondToExtraChargeDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages"; 

export class RespondToExtraChargeUseCase implements IUseCase<void, [RespondToExtraChargeDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: RespondToExtraChargeDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    // 1. Authorization
    if (booking.getCustomerId() !== input.customerId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 2. Update the specific Charge Status
    // This entity method also checks if all charges are resolved.
    // If all are resolved, it auto-switches status back to "IN_PROGRESS"
    booking.updateExtraChargeStatus(
        input.chargeId, 
        input.response === "APPROVE" ? "APPROVED" : "REJECTED",
        `customer:${input.customerId}`
    );

    // 3. Recalculate Final Price (If Approved)
    // Note: Commission Logic is handled at Payout. Here we just set the Total Customer Bill.
    // The Entity.calculateFinalPrice() sums: Base + Delivery + ApprovedExtras
    booking.calculateFinalPrice();

    // 4. Persist Changes
    // We update the charge status, the booking status, and the pricing
    await this._bookingRepo.update(booking); 

    // 5. Notify Technician
    const charge = booking.getExtraCharges().find(c => c.id === input.chargeId);
    
    await this._notificationService.send({
        recipientId: booking.getTechnicianId()!,
        recipientType: "TECHNICIAN",
        type: "CHARGE_UPDATE" as any, 
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