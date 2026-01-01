import { IServiceItemRepository, ServiceFilters } from "../../../domain/repositories/IServiceItemRepository";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { ServiceItemMapper } from "../../mappers/ServiceItemMapper";
import { ServiceItemResponseDto } from "../../dto/serviceItem/ServiceItemResponseDto";

export class GetServiceListingUseCase {
  constructor(
    private readonly _serviceItemRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(filters: ServiceFilters): Promise<ServiceItemResponseDto[]> {
    this._logger.info(`${LogEvents.SERVICE_GET_ALL_INIT} - Filters: ${JSON.stringify(filters)}`);

    const safeFilters = { ...filters, isActive: true };
    const services = await this._serviceItemRepo.findWithFilters(safeFilters);

    return services.map(service => ServiceItemMapper.toResponse(service));
  }
}