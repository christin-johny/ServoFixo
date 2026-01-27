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
 
    if (booking.getCustomerId() !== input.customerId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }
 
    booking.updateExtraChargeStatus(
        input.chargeId, 
        input.response === "APPROVE" ? "APPROVED" : "REJECTED",
        `customer:${input.customerId}`
    );
 
    booking.calculateFinalPrice(); 
    await this._bookingRepo.update(booking); 
 
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