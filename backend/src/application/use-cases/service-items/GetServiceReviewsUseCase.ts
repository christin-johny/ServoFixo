import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { Review } from "../../../domain/entities/Review";
import { ILogger } from "../../interfaces/ILogger";

export class GetServiceReviewsUseCase {
  constructor(
    private readonly _reviewRepo: IReviewRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(serviceId: string, limit: number = 5): Promise<Review[]> {
    return await this._reviewRepo.findByServiceId(serviceId, limit); 
  }
}