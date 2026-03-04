import { IVerifyPaymentUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { RazorpayService } from "../../../infrastructure/payments/RazorpayService";
import { ErrorMessages, NotificationMessages } from "../../constants/ErrorMessages";
import { VerifyPaymentDto } from "../../dto/booking/VerifyPaymentDto";
import { INotificationService } from "../../services/INotificationService";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes";
import { IUnitOfWork } from "../../interfaces/services/IUnitOfWork"; 
import { IDatabaseSession } from "../../interfaces/services/IDatabaseSession";
import { ICreditWalletOnJobCompletionUseCase } from "../../interfaces/use-cases/wallet/IWalletUseCases";

export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _paymentService: RazorpayService,
    private readonly _notificationService: INotificationService,
    private readonly _unitOfWork: IUnitOfWork,
    private readonly _creditWalletUseCase: ICreditWalletOnJobCompletionUseCase
  ) {}

  async execute(input: VerifyPaymentDto): Promise<void> {
    const isValid = this._paymentService.verifyPaymentSignature(
      input.orderId, 
      input.paymentId, 
      input.signature
    );
    if (!isValid) throw new Error(ErrorMessages.PAYMENT_SIGNATURE_INVALID);

    const session: IDatabaseSession = await this._unitOfWork.createSession();
    session.startTransaction();

    try { 
        const booking = await this._bookingRepo.findById(input.bookingId, session);
        if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
 
        booking.updateStatus("PAID", "system", "Payment verified via Razorpay");
         
        const payment = booking.getPayment();
        payment.status = "PAID";
        payment.razorpayPaymentId = input.paymentId;
        
        const amount = booking.getPricing().final || booking.getPricing().estimated;
        payment.amountPaid = amount;
           
        await this._bookingRepo.update(booking, session);
     
        const techId = booking.getTechnicianId();
        if (techId) {  
            await this._technicianRepo.updateAvailabilityStatus(techId, false, session);
 
            await this._creditWalletUseCase.execute({
                bookingId: booking.getId(),
                technicianId: techId,
                totalAmount: amount
            }, session);
        }
 
        await session.commitTransaction();
 
        if (techId) {
            this._notificationService.send({
                recipientId: techId,
                recipientType: "TECHNICIAN",
                type: NotificationType.BOOKING_STATUS_UPDATE, 
                title: NotificationMessages.TITLE_PAYMENT_RECEIVED,
                body: `Job #${booking.getId().slice(-4)}${NotificationMessages.BODY_PAYMENT_RECEIVED_TECH_SUFFIX}`,
                metadata: { bookingId: booking.getId(), status: "PAID" }
            });
        }

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
  }
}