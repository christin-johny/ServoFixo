import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";  
import { ILogger } from "../../interfaces/ILogger";
import { RateTechnicianDto } from "../../dto/booking/RateTechnicianDto";
import { Review } from "../../../domain/entities/Review";
import { ErrorMessages } from "../../constants/ErrorMessages";

export class RateTechnicianUseCase implements IUseCase<void, [RateTechnicianDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _reviewRepo: IReviewRepository,
    private readonly _serviceRepo: IServiceItemRepository,  
    private readonly _logger: ILogger
  ) {}

async execute(input: RateTechnicianDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.getCustomerId() !== input.customerId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const existingReview = await this._reviewRepo.findByBookingId(input.bookingId);
    console.log(existingReview)
    if (existingReview) {
        throw new Error("You have already rated this technician.");
    }
    
    if (booking.getStatus() !== "PAID" && booking.getStatus() !== "COMPLETED") {
        throw new Error("You can only rate completed jobs.");
    }

 
    const serviceId = booking.getServiceId();
    if (!serviceId) throw new Error("Booking does not have a linked Service ID.");
 
    const review = new Review({
        bookingId: input.bookingId,
        customerId: input.customerId,
        technicianId: booking.getTechnicianId()!,
        serviceId: serviceId, 
        rating: input.rating,
        comment: input.comment,
        isDeleted:input.isDeleted || false
    });
 
    await this._reviewRepo.create(review);
    await this._bookingRepo.markAsRated(booking.getId());
 
    if (booking.getTechnicianId()) {
        await this._technicianRepo.addRating(booking.getTechnicianId()!, input.rating);
    }
 
    await this._serviceRepo.addRating(serviceId, input.rating);
  }
}