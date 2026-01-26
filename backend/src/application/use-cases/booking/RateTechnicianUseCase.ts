import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { IReviewRepository } from "../../../domain/repositories/IReviewRepository"; // <--- New
import { ILogger } from "../../interfaces/ILogger";
import { Review } from "../../../domain/entities/Review";

export class RateTechnicianDto {
    bookingId!: string;
    customerId!: string;
    rating!: number;
    comment?: string;
}

export class RateTechnicianUseCase implements IUseCase<void, [RateTechnicianDto]> {
    constructor(
        private readonly _bookingRepo: IBookingRepository,
        private readonly _techRepo: ITechnicianRepository,
        private readonly _reviewRepo: IReviewRepository, // <--- Inject this
        private readonly _logger: ILogger
    ) {}

    async execute(input: RateTechnicianDto): Promise<void> {
        const booking = await this._bookingRepo.findById(input.bookingId);
        if (!booking) throw new Error("Booking not found");

        if (booking.getCustomerId() !== input.customerId) throw new Error("Unauthorized");

        // 1. Create Review Entity
        const review = new Review({
            bookingId: input.bookingId,
            customerId: input.customerId,
            technicianId: booking.getTechnicianId()!,
            rating: input.rating,
            comment: input.comment
        });

        // 2. Save Review
        await this._reviewRepo.create(review);

        // 3. Update Technician's Aggregate Score (Average)
        const techId = booking.getTechnicianId();
        if (techId) { 
            await this._techRepo.addRating(techId, input.rating);
        }

        this._logger.info(`Review saved for booking ${input.bookingId}`);
    }
}