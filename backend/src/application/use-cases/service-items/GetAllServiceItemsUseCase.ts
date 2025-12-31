import { IServiceItemRepository, ServiceItemQueryParams, PaginatedServiceItems } from '../../../domain/repositories/IServiceItemRepository';

export class GetAllServiceItemsUseCase {
  constructor(private readonly _serviceRepo: IServiceItemRepository) {}

  async execute(params: ServiceItemQueryParams): Promise<PaginatedServiceItems> {
    return this._serviceRepo.findAll(params);
  }
}