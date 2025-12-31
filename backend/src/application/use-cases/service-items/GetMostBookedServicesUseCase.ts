import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { ServiceItem } from "../../../domain/entities/ServiceItem";

export class GetMostBookedServicesUseCase {
  constructor(private readonly _serviceItemRepo: IServiceItemRepository) {}

  async execute(limit: number = 5): Promise<ServiceItem[]> {
    return await this._serviceItemRepo.findMostBooked(limit);
  }
}