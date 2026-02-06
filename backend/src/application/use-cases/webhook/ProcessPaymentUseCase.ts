import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService"; //   Added
import { ILogger } from "../../interfaces/ILogger";
import { ProcessPaymentDto } from "../../dto/webhook/ProcessPaymentDto";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes"; //   Added

export class ProcessPaymentUseCase implements IUseCase<void, [ProcessPaymentDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService, //   Inject Notification Service
    private readonly _logger: ILogger
  ) {}

  async execute(input: ProcessPaymentDto): Promise<void> {
    // 1. Find the booking
    const booking = await this._bookingRepo.findByPaymentOrderId(input.orderId);
    
    if (!booking) {
        this._logger.warn(`Webhook ignored: Booking not found for Order ID ${input.orderId}`);
        return;
    }

    // 2. Idempotency Check (Don't process if already paid)
    if (booking.getStatus() === "PAID") {
        this._logger.info(`Webhook ignored: Booking ${booking.getId()} already PAID.`);
        return;
    }

    // 3. Update Status (Use Entity Logic for safety)
    // This ensures both root 'status' and 'payment.status' are updated
    booking.updateStatus("PAID", "system", "Payment confirmed via Webhook");
    
    const payment = booking.getPayment();
    payment.status = "PAID";
    payment.razorpayPaymentId = input.transactionId;
    
    await this._bookingRepo.update(booking);

    // 4. Unlock the Technician
    const techId = booking.getTechnicianId();
    if (techId) { 
        await this._technicianRepo.updateAvailabilityStatus(techId, false);
        this._logger.info(`Technician ${techId} released from job.`);
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

    this._logger.info(`Booking ${booking.getId()} payment confirmed via Webhook.`);
  }
}