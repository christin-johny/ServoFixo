import { IServiceItemRepository, ServiceFilters } from "../../../domain/repositories/IServiceItemRepository";

export class GetServiceListingUseCase {
  constructor(private serviceItemRepo: IServiceItemRepository) {}

  async execute(filters: ServiceFilters) {
    // SECURITY: Force 'isActive' to true.
    // Customers should never be able to see disabled/deleted services,
    // even if they try to hack the URL params.
    const safeFilters = { ...filters, isActive: true };
    
    return await this.serviceItemRepo.findWithFilters(safeFilters);
  }
}