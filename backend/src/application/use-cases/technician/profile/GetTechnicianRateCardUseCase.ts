import { ILogger } from "../../../interfaces/services/ILogger";
import { IUseCase } from "../../../interfaces/services/IUseCase";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";
import { ICommissionStrategy } from "../../../interfaces/services/ICommissionStrategy";
import { RateCardItem } from "../../../dto/technician/TechnicianProfileDto";

export interface ITechnicianRepositoryForRateCard {
  findById(id: string): Promise<{ getSubServiceIds(): string[] } | null>;
}

export interface IServiceItemRepositoryForRateCard {
  findById(id: string): Promise<{ getId(): string; getName(): string; getBasePrice(): number } | null>;
}



export class GetTechnicianRateCardUseCase implements IUseCase<RateCardItem[], [string]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepositoryForRateCard, 
    private readonly _serviceRepo: IServiceItemRepositoryForRateCard,    
    private readonly _commissionStrategy: ICommissionStrategy,           
    private readonly _logger: ILogger                                   
  ) {}

  async execute(technicianId: string): Promise<RateCardItem[]> {
    const technician = await this._technicianRepo.findById(technicianId);
    
    if (!technician) {
      this._logger.warn(LogEvents.TECH_PROFILE_ERROR, { message: "Technician not found for Rate Card", technicianId });
      throw new Error("Technician not found");
    }

    const selectedServiceIds = technician.getSubServiceIds();

    if (!selectedServiceIds || selectedServiceIds.length === 0) {
      return [];
    }

    const rateCard: RateCardItem[] = [];
 
    for (const serviceId of selectedServiceIds) {
      const service = await this._serviceRepo.findById(serviceId);
      
      if (service) {
        const basePrice = service.getBasePrice();
        const name = service.getName();

        const fee = this._commissionStrategy.calculateCommission(basePrice);
        const rate = this._commissionStrategy.getCommissionRate();
        const share = basePrice - fee;

        rateCard.push({
          serviceId: service.getId(),
          name: name,
          basePrice: basePrice,
          platformFee: Math.round(fee),
          technicianShare: Math.round(share),
          commissionPercentage: rate
        });
      }
    }

    return rateCard;
  }
}