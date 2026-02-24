import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { ServiceItemMapper } from "../../mappers/ServiceItemMapper";
import { ServiceItemResponseDto } from "../../dto/serviceItem/ServiceItemResponseDto";
import { IGetMostBookedServicesUseCase } from "../../interfaces/use-cases/serviceItem/IServiceItemUseCases";

export class GetMostBookedServicesUseCase implements IGetMostBookedServicesUseCase{
  constructor(
    private readonly _serviceItemRepo: IServiceItemRepository, 
  ) {}

  async execute(limit: number = 5): Promise<ServiceItemResponseDto[]> {
    

    const services = await this._serviceItemRepo.findMostBooked(limit);

    return services.map(service => ServiceItemMapper.toResponse(service));
  }
}