import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { IPaymentGateway } from "../../../domain/repositories/IPaymentGateway"; // <--- New Interface
import { ILogger } from "../../interfaces/ILogger";
import { CompleteJobDto } from "../../dto/booking/CompleteJobDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";

export class CompleteJobUseCase implements IUseCase<void, [CompleteJobDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _paymentGateway: IPaymentGateway,  
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: CompleteJobDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
 
    // 1. Authorization
    if (booking.getTechnicianId() !== input.technicianId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }
 
    // 2. Validate State
    if (booking.getStatus() !== "IN_PROGRESS") {
        throw new Error("Job must be IN_PROGRESS to complete it.");
    }
 
    // 3. Validate Extra Charges (Prevent completing with pending disputes)
    const hasPendingCharges = booking.getExtraCharges().some(c => c.status === "PENDING");
    if (hasPendingCharges) {
        throw new Error("Cannot complete job. There are pending extra charges.");
    }
 
    // 4. Finalize Pricing
    booking.calculateFinalPrice();
    const finalAmount = booking.getPricing().final || booking.getPricing().estimated;
 
    // 5. Generate Payment Order (Razorpay)
    // We create the order now so the frontend can immediately show the "Pay Now" button
    const orderId = await this._paymentGateway.createOrder(
        finalAmount, 
        "INR", 
        booking.getId()
    );
 
    // 6. Update Booking State
    booking.updateStatus("COMPLETED", `tech:${input.technicianId}`, "Job finished by technician");
    
    // Manually set the payment details on the entity (You might need a setter in Booking.ts)
    // Assuming you added a method like setPaymentOrder(orderId) or accessing via getter
    const payment = booking.getPayment();
    payment.razorpayOrderId = orderId;
    payment.status = "PENDING";

    // 7. Persist
    await this._bookingRepo.update(booking);

    // 8. Notify Customer (Invoice)
    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: "JOB_COMPLETED" as any, 
        title: "Job Completed! ✅",
        body: `Total Bill: ₹${finalAmount}. Please pay now.`,
        metadata: { 
            bookingId: booking.getId(), 
            amount: finalAmount.toString(),
            orderId: orderId
        },
        clickAction: `/customer/bookings/${booking.getId()}/payment`
    });

    this._logger.info(`Job ${booking.getId()} COMPLETED. Invoice: ₹${finalAmount}`);
  }
}