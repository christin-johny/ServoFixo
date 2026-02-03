import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { Review } from "../../../domain/entities/Review";
import { ReviewModel, ReviewDocument } from "../mongoose/models/ReviewModel";

export class ReviewMongoRepository implements IReviewRepository {
  
  async create(review: Review): Promise<Review> {
    const props = review.toProps();
    
    // 1. Create the document (Now includes serviceId)
    const doc = await ReviewModel.create({
        bookingId: props.bookingId,
        customerId: props.customerId,
        technicianId: props.technicianId,
        serviceId: props.serviceId, // ✅ Saving Service ID
        rating: props.rating,
        comment: props.comment,
        createdAt: props.createdAt
    });

    // 2. Return the Domain Entity
    return this.toDomain(doc);
  }

  async update(review: Review): Promise<Review> {
      throw new Error("Method not implemented."); 
  }

  async delete(id: string): Promise<boolean> {
      throw new Error("Method not implemented.");
  }

  async findById(id: string): Promise<Review | null> {
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

async findByServiceId(serviceId: string, limit: number): Promise<Review[]> {
    const docs = await ReviewModel.find({ 
        serviceId: serviceId,
        isDeleted: { $ne: true } 
    })
    .sort({ createdAt: -1 }) // Newest first
    .limit(limit)
    // Populate customer details to show Name/Avatar in the comment section
    .populate("customerId", "name avatarUrl") 
    .exec();

    return docs.map(doc => this.toDomain(doc));
  }

  private toDomain(doc: any): Review {
    return new Review({
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      customerId: doc.customerId._id 
        ? doc.customerId._id.toString() 
        : doc.customerId.toString(), // Handle populated vs unpopulated
      serviceId: doc.serviceId.toString(),
      technicianId: doc.technicianId.toString(),
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
       isDeleted:doc.isDeleted|| false,
      customerSnapshot: doc.customerId.name ? {
          name: doc.customerId.name,
          avatarUrl: doc.customerId.avatarUrl
      } : undefined
    });
  }
}