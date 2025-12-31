import { IServiceItemRepository, ServiceFilters } from "../../../domain/repositories/IServiceItemRepository";

export class GetServiceListingUseCase {
  constructor(private _serviceItemRepo: IServiceItemRepository) {}

  async execute(filters: ServiceFilters) {

    const safeFilters = { ...filters, isActive: true };

    return await this._serviceItemRepo.findWithFilters(safeFilters);
  }
}