import { IServiceItemRepository, ServiceItemQueryParams } from '../../../domain/repositories/IServiceItemRepository';
import { PaginatedServiceResponse } from '../../dto/serviceItem/ServiceItemResponseDto';
import { IGetAllServiceItemsUseCase } from '../../interfaces/use-cases/serviceItem/IServiceItemUseCases';
import { ServiceItemMapper } from '../../mappers/ServiceItemMapper'; 



export class GetAllServiceItemsUseCase implements IGetAllServiceItemsUseCase{
  constructor(
    private readonly _serviceRepo: IServiceItemRepository 
  ) {}

  async execute(params: ServiceItemQueryParams): Promise<PaginatedServiceResponse> {
    const result = await this._serviceRepo.findAll(params);
    
    return {
        data: result.data.map(ServiceItemMapper.toResponse),
        total: result.total,
        currentPage: result.currentPage,
        totalPages: result.totalPages
    };
  }
}