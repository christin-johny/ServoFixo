import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { Review } from "../../../domain/entities/Review"; 
import { IGetServiceReviewsUseCase } from "../../interfaces/use-cases/serviceItem/IServiceItemUseCases";

export class GetServiceReviewsUseCase  implements IGetServiceReviewsUseCase{
  constructor(
    private readonly _reviewRepo: IReviewRepository 
  ) {}

  async execute(serviceId: string, limit: number = 5): Promise<Review[]> {
    return await this._reviewRepo.findByServiceId(serviceId, limit); 
  }
}