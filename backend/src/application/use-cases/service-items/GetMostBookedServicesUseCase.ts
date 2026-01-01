import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { ServiceItemMapper } from "../../mappers/ServiceItemMapper";
import { ServiceItemResponseDto } from "../../dto/serviceItem/ServiceItemResponseDto";

export class GetMostBookedServicesUseCase {
  constructor(
    private readonly _serviceItemRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(limit: number = 5): Promise<ServiceItemResponseDto[]> {
    this._logger.info(`${LogEvents.SERVICE_MOST_BOOKED_FETCH} - Limit: ${limit}`);

    const services = await this._serviceItemRepo.findMostBooked(limit);

    return services.map(service => ServiceItemMapper.toResponse(service));
  }
}