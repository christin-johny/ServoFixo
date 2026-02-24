 
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { RazorpayService } from "../../../infrastructure/payments/RazorpayService"; 
import { INotificationService } from "../../services/INotificationService";  
import { ErrorMessages, NotificationMessages } from "../../constants/ErrorMessages";
import { VerifyPaymentDto } from "../../dto/booking/VerifyPaymentDto";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes"; 
import { IVerifyPaymentUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";

export class VerifyPaymentUseCase implements IVerifyPaymentUseCase{
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _paymentService: RazorpayService,
    private readonly _notificationService: INotificationService 
  ) {}

  async execute(input: VerifyPaymentDto): Promise<void> {
    const isValid = this._paymentService.verifyPaymentSignature(
        input.orderId, 
        input.paymentId, 
        input.signature
    );

    if (!isValid) {
        throw new Error(ErrorMessages.PAYMENT_SIGNATURE_INVALID);
    }

    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    booking.updateStatus("PAID", "system", "Payment verified via Razorpay");
      
    const payment = booking.getPayment();
    payment.status = "PAID";
    payment.razorpayPaymentId = input.paymentId;
      
    await this._bookingRepo.update(booking);
 
    const techId = booking.getTechnicianId();
    if (techId) { 
        await this._technicianRepo.updateAvailabilityStatus(techId, false);
    }

    if (techId) {
        await this._notificationService.send({
            recipientId: techId,
            recipientType: "TECHNICIAN",
            type: NotificationType.BOOKING_STATUS_UPDATE, 
            title: NotificationMessages.TITLE_PAYMENT_RECEIVED,
            body: `Job #${booking.getId().slice(-4)}${NotificationMessages.BODY_PAYMENT_RECEIVED_TECH_SUFFIX}`,
            metadata: { 
                bookingId: booking.getId(),
                status: "PAID" 
            }
        });
    }
    await this._notificationService.send({
        recipientId: "ADMIN_BROADCAST_CHANNEL",
        recipientType: "ADMIN",
        type: NotificationType.ADMIN_STATUS_UPDATE  ,
        title: NotificationMessages.TITLE_PAYMENT_RECEIVED_ADMIN,
        body: `Booking #${booking.getId().slice(-6)}${NotificationMessages.BODY_PAYMENT_RECEIVED_ADMIN_SUFFIX}`,
        metadata: { 
            bookingId: booking.getId(), 
            status: "PAID" 
        }
    });

  }
}