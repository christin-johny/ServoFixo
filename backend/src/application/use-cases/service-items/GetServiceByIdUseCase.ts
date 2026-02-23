import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { ILogger } from '../../interfaces/ILogger';
import { LogEvents } from '../../../infrastructure/logging/LogEvents';
import { ServiceItemMapper } from '../../mappers/ServiceItemMapper';
import { ServiceItemResponseDto } from '../../dto/serviceItem/ServiceItemResponseDto';
import { ErrorMessages } from '../../constants/ErrorMessages';

export class GetServiceByIdUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string): Promise<ServiceItemResponseDto | null> {
    

    const service = await this._serviceRepo.findById(id);
    if (!service) {
      this._logger.warn(`${LogEvents.SERVICE_NOT_FOUND} - ID: ${id}`);
      return null;
    }

    return ServiceItemMapper.toResponse(service);
  }
}