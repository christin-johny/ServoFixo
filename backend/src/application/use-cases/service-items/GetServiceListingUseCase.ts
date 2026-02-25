import { IServiceItemRepository, ServiceFilters } from "../../../domain/repositories/IServiceItemRepository";
import { ServiceItemMapper } from "../../mappers/ServiceItemMapper";
import { ServiceItemResponseDto } from "../../dto/serviceItem/ServiceItemResponseDto";
import { IGetServiceListingUseCase } from "../../interfaces/use-cases/serviceItem/IServiceItemUseCases";

export class GetServiceListingUseCase  implements IGetServiceListingUseCase{
  constructor(
    private readonly _serviceItemRepo: IServiceItemRepository, 
  ) {}

  async execute(filters: ServiceFilters): Promise<ServiceItemResponseDto[]> {
    

    const safeFilters = { ...filters, isActive: true };
    const services = await this._serviceItemRepo.findWithFilters(safeFilters);

    return services.map(service => ServiceItemMapper.toResponse(service));
  }
}