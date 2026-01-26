import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { CancelBookingDto } from "../../dto/booking/CancelBookingDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class CustomerCancelBookingUseCase implements IUseCase<void, [CancelBookingDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
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
    if (currentStatus === "COMPLETED" || currentStatus === "PAID" || currentStatus === "CANCELLED") {
        throw new Error("Cannot cancel a completed or already cancelled booking.");
    }

    // --- FEE CALCULATION (Flow G3) ---
    // Rule: If Tech has REACHED, charge ₹50 fee.
    let cancellationFee = 0;
    if (currentStatus === "REACHED" || currentStatus === "IN_PROGRESS") {
        cancellationFee = 50; 
        // Logic: Update pricing to reflect the fee
        const pricing = booking.getPricing();
        pricing.final = cancellationFee; 
        pricing.deliveryFee = 0; // Clear other fees
        // In a real app, you would trigger a wallet deduction here
    }

    // Update Status
    booking.updateStatus("CANCELLED", `customer:${input.userId}`, input.reason);
    
    // Persist
    await this._bookingRepo.update(booking);

    // Notify Technician (if one was assigned)
    const techId = booking.getTechnicianId();
    if (techId) {
        await this._notificationService.send({
            recipientId: techId,
            recipientType: "TECHNICIAN",
            type: "BOOKING_CANCELLED" as any,
            title: "Booking Cancelled ❌",
            body: "The customer has cancelled the booking. You are free now.",
            metadata: { bookingId: booking.getId() }
        });
    }

    this._logger.info(`Booking ${booking.getId()} cancelled by customer. Fee: ₹${cancellationFee}`);
  }
}