import { IServiceItemRepository, ServiceItemQueryParams } from '../../../domain/repositories/IServiceItemRepository';
import { ServiceItemResponseDto } from '../../dto/serviceItem/ServiceItemResponseDto';
import { ServiceItemMapper } from '../../mappers/ServiceItemMapper';
import { ILogger } from '../../interfaces/ILogger';
import { LogEvents } from '../../../../../shared/constants/LogEvents';

export interface PaginatedServiceResponse {
    data: ServiceItemResponseDto[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export class GetAllServiceItemsUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(params: ServiceItemQueryParams): Promise<PaginatedServiceResponse> {
    this._logger.info(`${LogEvents.SERVICE_GET_ALL_INIT} - Params: ${JSON.stringify(params)}`);
    
    const result = await this._serviceRepo.findAll(params);
    
    return {
        data: result.data.map(ServiceItemMapper.toResponse),
        total: result.total,
        currentPage: result.currentPage,
        totalPages: result.totalPages
    };
  }
}