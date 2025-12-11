import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { ServiceItem } from "../../../domain/entities/ServiceItem";

export class GetMostBookedServicesUseCase {
  constructor(private readonly serviceItemRepo: IServiceItemRepository) {}

  async execute(limit: number = 5): Promise<ServiceItem[]> {
    return await this.serviceItemRepo.findMostBooked(limit);
  }
}