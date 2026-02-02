import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
// ✅ CORRECTED IMPORT PATH
import { RazorpayService } from "../../../infrastructure/payments/RazorpayService"; 
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { VerifyPaymentDto } from "../../dto/booking/VerifyPaymentDto";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";

export class VerifyPaymentUseCase implements IUseCase<void, [VerifyPaymentDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _paymentService: RazorpayService,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: VerifyPaymentDto): Promise<void> {
    // 1. Verify Signature FIRST (Security Check)
    const isValid = this._paymentService.verifyPaymentSignature(
        input.orderId, 
        input.paymentId, 
        input.signature
    );

    if (!isValid) {
        throw new Error("Payment verification failed. Invalid signature.");
    }

    // 2. Find Booking
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    // 3. ✅ DOMAIN FIX: Update Entity directly (Fixes DB Mismatch)
    // explicitly setting the root status to "PAID" ensures the UI updates correctly
    booking.updateStatus("PAID", "system", "Payment verified via Razorpay");
     
    const payment = booking.getPayment();
    payment.status = "PAID";
    payment.razorpayPaymentId = input.paymentId;
     
    await this._bookingRepo.update(booking);
 
    const techId = booking.getTechnicianId();
    if (techId) { 
        await this._technicianRepo.updateAvailabilityStatus(techId, false);
    }

    // 5. ✅ SOCKET FIX: Send 'BOOKING_STATUS_UPDATE'
    // This matches what your TechnicianLayout.tsx is listening for!
    if (techId) {
        await this._notificationService.send({
            recipientId: techId,
            recipientType: "TECHNICIAN",
            type: NotificationType.BOOKING_STATUS_UPDATE, 
            title: "Payment Received! 💰",
            body: `Job #${booking.getId().slice(-4)} is fully paid. Great work!`,
            metadata: { 
                bookingId: booking.getId(),
                status: "PAID" // The frontend sees this and hides the footer
            }
        });
    }

    this._logger.info(`Payment verified for Booking ${booking.getId()}`);
  }
}