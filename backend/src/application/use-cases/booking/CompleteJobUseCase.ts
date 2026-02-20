import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { IPaymentGateway } from "../../../domain/repositories/IPaymentGateway"; 
import { IImageService } from "../../interfaces/IImageService"; 
import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository"; 
import { ILogger } from "../../interfaces/ILogger";
import { CompleteJobDto } from "../../dto/booking/CompleteJobDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
 
export interface IFile {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
}
 
export class CompleteJobUseCase implements IUseCase<void, [CompleteJobDto, IFile?]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _paymentGateway: IPaymentGateway,  
    private readonly _notificationService: INotificationService,
    private readonly _imageService: IImageService, 
    private readonly _serviceRepo: IServiceItemRepository, 
    private readonly _logger: ILogger
  ) {}
 
  async execute(input: CompleteJobDto, proofFile?: IFile): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
 
    if (booking.getTechnicianId() !== input.technicianId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }
  
    if (booking.getStatus() !== "IN_PROGRESS") {
        throw new Error("Job must be IN_PROGRESS to complete it.");
    }
  
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
  
    booking.updateStatus("COMPLETED", `tech:${input.technicianId}`, "Job finished by technician");

    const serviceId = booking.getServiceId();
    if (serviceId) { 
        await this._serviceRepo.incrementBookingCount(serviceId);
    }
    
    const payment = booking.getPayment();
    payment.razorpayOrderId = orderId;
    payment.status = "PENDING";
 
    await this._bookingRepo.update(booking);
 
    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: "JOB_COMPLETED" as any, 
        title: "Job Completed!  ",
        body: `Total Bill: ₹${finalAmount}. Please pay now.`,
        metadata: { 
            bookingId: booking.getId(), 
            amount: finalAmount.toString(),
            orderId: orderId
        },
        clickAction: `/customer/bookings/${booking.getId()}/payment`
    });

  }
}