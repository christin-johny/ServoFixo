import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService";  
import { ILogger } from "../../interfaces/services/ILogger";
import { ProcessPaymentDto } from "../../dto/webhook/ProcessPaymentDto";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes"; 
import { IProcessPaymentUseCase } from "../../interfaces/use-cases/webhook/IWebhookUseCases";
import { ICreditWalletOnJobCompletionUseCase } from "../../interfaces/use-cases/wallet/IWalletUseCases";
import { IUnitOfWork } from "../../interfaces/services/IUnitOfWork";
import { IDatabaseSession } from "../../interfaces/services/IDatabaseSession";

export class ProcessPaymentUseCase implements IProcessPaymentUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,  
    private readonly _logger: ILogger,
    private readonly _unitOfWork: IUnitOfWork,  
    private readonly _creditWalletUseCase: ICreditWalletOnJobCompletionUseCase  
  ) {}

  async execute(input: ProcessPaymentDto): Promise<void> { 
    const session: IDatabaseSession = await this._unitOfWork.createSession();
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
    
        // 2. Update Booking & Payment Status
        booking.updateStatus("PAID", "system", "Payment confirmed via Webhook");
        const payment = booking.getPayment();
        payment.status = "PAID";
        payment.razorpayPaymentId = input.transactionId;
        
        const amount = booking.getPricing().final || booking.getPricing().estimated;
        payment.amountPaid = amount;
        
        await this._bookingRepo.update(booking, session);
    
        const techId = booking.getTechnicianId();
        if (techId) { 
            // 3. Update Tech Availability
            await this._technicianRepo.updateAvailabilityStatus(techId, false, session);

            // 4. INTEGRATION: Credit Technician Wallet (90%)
            // This is vital for the Webhook to trigger the actual earning
            await this._creditWalletUseCase.execute({
                bookingId: booking.getId(),
                technicianId: techId,
                totalAmount: amount
            }, session);
        }

        // 5. Commit all changes (Booking + Wallet)
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

    } catch (error: any) {
        await session.abortTransaction();
        this._logger.error(`Webhook Transaction Failed: ${error.message}`);
        throw error;
    } finally {
        session.endSession();
    }
  }
}