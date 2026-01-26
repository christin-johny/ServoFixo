import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { Review } from "../../../domain/entities/Review";
import { ReviewModel, ReviewDocument } from "../mongoose/models/ReviewModel";

export class ReviewMongoRepository implements IReviewRepository {
  
  // FIX: Return Promise<Review> instead of Promise<void>
  async create(review: Review): Promise<Review> {
    const props = review.toProps();
    
    // 1. Create the document
    const doc = await ReviewModel.create({
        bookingId: props.bookingId,
        customerId: props.customerId,
        technicianId: props.technicianId,
        rating: props.rating,
        comment: props.comment,
        createdAt: props.createdAt
    });

    // 2. Return the Domain Entity to satisfy IBaseRepository signature
    return this.toDomain(doc);
  }

  // ... (Rest of the file remains the same)

  async update(review: Review): Promise<Review> {
      // Stub implementation if IBaseRepository requires it, 
      // though reviews are usually immutable.
      throw new Error("Method not implemented."); 
  }

  async delete(id: string): Promise<boolean> {
      // Stub implementation
      throw new Error("Method not implemented.");
  }

  async findById(id: string): Promise<Review | null> {
      // Stub implementation
      throw new Error("Method not implemented.");
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    const doc = await ReviewModel.findOne({ bookingId }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByTechnicianId(techId: string, limit: number): Promise<Review[]> {
    const docs = await ReviewModel.find({ technicianId: techId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map(d => this.toDomain(d));
  }

  private toDomain(doc: ReviewDocument): Review {
    return new Review({
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      customerId: doc.customerId.toString(),
      technicianId: doc.technicianId.toString(),
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt
    });
  }
}