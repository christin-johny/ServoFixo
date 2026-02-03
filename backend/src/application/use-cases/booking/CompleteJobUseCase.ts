import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { IPaymentGateway } from "../../../domain/repositories/IPaymentGateway"; 
import { IImageService } from "../../interfaces/IImageService"; 
import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository"; 
import { ILogger } from "../../interfaces/ILogger";
import { CompleteJobDto } from "../../dto/booking/CompleteJobDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages"; 

// ✅ Define IFile locally or import it if you have a shared type
export interface IFile {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
}

// ✅ FIX 1: Update the Tuple type to accept [Dto, File?]
export class CompleteJobUseCase implements IUseCase<void, [CompleteJobDto, IFile?]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _paymentGateway: IPaymentGateway,  
    private readonly _notificationService: INotificationService,
    private readonly _imageService: IImageService, 
    private readonly _serviceRepo: IServiceItemRepository, 
    private readonly _logger: ILogger
  ) {}

  // ✅ FIX 2: Update execute signature
  async execute(input: CompleteJobDto, proofFile?: IFile): Promise<void> {
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
 
    // 3. Validate Extra Charges
    const hasPendingCharges = booking.getExtraCharges().some(c => c.status === "PENDING");
    if (hasPendingCharges) {
        throw new Error("Cannot complete job. There are pending extra charges.");
    }  
    if (proofFile) {
         const photoUrl = await this._imageService.uploadImage(
             proofFile.buffer,
             proofFile.originalName, 
             proofFile.mimeType
         );
         console.log(photoUrl) 
         booking.addCompletionPhoto(photoUrl);
    }  
    else if (booking.getCompletionPhotos().length === 0) {
        throw new Error("Work proof photo is required.");
    } 
    booking.calculateFinalPrice();
    const finalAmount = booking.getPricing().final || booking.getPricing().estimated;
  
    const orderId = await this._paymentGateway.createOrder(
        finalAmount, 
        "INR", 
        booking.getId()
    );
 
    // 6. Update Booking State
    booking.updateStatus("COMPLETED", `tech:${input.technicianId}`, "Job finished by technician");

    const serviceId = booking.getServiceId();
    if (serviceId) { 
        await this._serviceRepo.incrementBookingCount(serviceId);
    }
    
    const payment = booking.getPayment();
    payment.razorpayOrderId = orderId;
    payment.status = "PENDING";

    // 7. Persist
    await this._bookingRepo.update(booking);

    // 8. Notify Customer
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