import { IServiceItemRepository, ServiceItemQueryParams, PaginatedServiceItems } from '../../../domain/repositories/IServiceItemRepository';

export class GetAllServiceItemsUseCase {
  constructor(private readonly serviceRepo: IServiceItemRepository) {}

  async execute(params: ServiceItemQueryParams): Promise<PaginatedServiceItems> {
    return this.serviceRepo.findAll(params);
  }
}