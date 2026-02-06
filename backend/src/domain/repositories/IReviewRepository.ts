import { Review } from "../entities/Review";
import { IBaseRepository } from "./IBaseRepository";

export interface IReviewRepository extends IBaseRepository<Review> {
  findByBookingId(bookingId: string): Promise<Review | null>;
  findByTechnicianId(techId: string, limit: number): Promise<Review[]>;
  findByServiceId(serviceId: string, limit: number): Promise<Review[]>;
}