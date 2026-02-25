
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService";  
import { ILogger } from "../../interfaces/services/ILogger";
import { ProcessPaymentDto } from "../../dto/webhook/ProcessPaymentDto";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes"; 
import { IProcessPaymentUseCase } from "../../interfaces/use-cases/webhook/IWebhookUseCases";

export class ProcessPaymentUseCase implements IProcessPaymentUseCase{
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,  
    private readonly _logger: ILogger
  ) {}

  async execute(input: ProcessPaymentDto): Promise<void> {
 
    const booking = await this._bookingRepo.findByPaymentOrderId(input.orderId);
    
    if (!booking) {
        this._logger.warn(`Webhook ignored: Booking not found for Order ID ${input.orderId}`);
        return;
    }
 
    if (booking.getStatus() === "PAID") {
        return;
    }
 
    booking.updateStatus("PAID", "system", "Payment confirmed via Webhook");
    
    const payment = booking.getPayment();
    payment.status = "PAID";
    payment.razorpayPaymentId = input.transactionId;
    
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
            title: "Payment Received! 💰",
            body: `Job #${booking.getId().slice(-4)} is fully paid via Webhook.`,
            metadata: { 
                bookingId: booking.getId(),
                status: "PAID"
            }
        });
    }
  }
}