
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService";  
import { ILogger } from "../../interfaces/services/ILogger";
import { ProcessPaymentDto } from "../../dto/webhook/ProcessPaymentDto";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes"; 
import { IProcessPaymentUseCase } from "../../interfaces/use-cases/webhook/IWebhookUseCases";



import mongoose, { ClientSession } from "mongoose"; 

export class ProcessPaymentUseCase implements IProcessPaymentUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,  
    private readonly _logger: ILogger
  ) {}

  async execute(input: ProcessPaymentDto): Promise<void> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        const booking = await this._bookingRepo.findByPaymentOrderId(input.orderId, session);
        
        if (!booking) {
            this._logger.warn(`Webhook ignored: Booking not found for Order ID ${input.orderId}`);
            await session.abortTransaction();
            return;
        }
    
        if (booking.getStatus() === "PAID") {
            await session.abortTransaction();
            return;
        }
    
        booking.updateStatus("PAID", "system", "Payment confirmed via Webhook");
        const payment = booking.getPayment();
        payment.status = "PAID";
        payment.razorpayPaymentId = input.transactionId;
        
        await this._bookingRepo.update(booking, session);
    
        const techId = booking.getTechnicianId();
        if (techId) { 
            await this._technicianRepo.updateAvailabilityStatus(techId, false, session);
        }

        await session.commitTransaction();
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

    } catch (error: unknown) {
        await session.abortTransaction();

        let message = "Unknown error";

        if (error instanceof Error) {
            message = error.message;
        }

        this._logger.error(`Webhook Transaction Failed: ${message}`);

        throw error;
        } finally {
        await session.endSession();
    }
  }
}