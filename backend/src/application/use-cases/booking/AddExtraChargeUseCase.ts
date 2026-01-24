import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { AddExtraChargeDto } from "../../dto/booking/AddExtraChargeDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ExtraCharge } from "../../../../../shared/types/value-objects/BookingTypes";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";

export class AddExtraChargeUseCase implements IUseCase<void, [AddExtraChargeDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: AddExtraChargeDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    // 1. Validation: Authorization
    if (booking.getTechnicianId() !== input.technicianId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 2. Create the Charge Object (Value Object)
    const newCharge: ExtraCharge = {
        id: new Date().getTime().toString(), // Simple ID generation or use uuid
        title: input.title,
        amount: input.amount,
        description: input.description || "",
        proofUrl: input.proofUrl,
        status: "PENDING",
        addedByTechId: input.technicianId,
        addedAt: new Date()
    };

    // 3. Logic: Update Domain Entity (Validates state transitions)
    // This ensures we can only add charges if IN_PROGRESS or EXTRAS_PENDING
    booking.addExtraCharge(newCharge);

    // 4. Persist (Atomic Push)
    await this._bookingRepo.addExtraCharge(booking.getId(), newCharge);

    // 5. Notify Customer (Request Approval)
    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: "BOOKING_APPROVAL_REQUEST" as any, // Add to your Enum
        title: "Additional Part Required ⚠️",
        body: `Technician added ${input.title} for ₹${input.amount}. Please approve.`,
        metadata: { 
            bookingId: booking.getId(), 
            chargeId: newCharge.id,
            amount: input.amount.toString() 
        },
        clickAction: `/customer/bookings/${booking.getId()}?action=approve_charge`
    });

    this._logger.info(`Extra charge added to booking ${booking.getId()}: ${input.title}`);
  }
}