import { ILogger } from "../../../interfaces/ILogger";
import { IUseCase } from "../../../interfaces/IUseCase";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { ICommissionStrategy } from "../../../../application/interfaces/ICommissionStrategy";

export interface ITechnicianRepositoryForRateCard {
  findById(id: string): Promise<{ getSubServiceIds(): string[] } | null>;
}

export interface IServiceItemRepositoryForRateCard {
  findById(id: string): Promise<{ getId(): string; getName(): string; getBasePrice(): number } | null>;
}

export interface RateCardItem {
  serviceId: string;
  name: string;
  basePrice: number;
  platformFee: number;
  technicianShare: number;
  commissionPercentage: number;
}

export class GetTechnicianRateCardUseCase implements IUseCase<RateCardItem[], [string]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepositoryForRateCard, // Abstract
    private readonly _serviceRepo: IServiceItemRepositoryForRateCard,   // Abstract
    private readonly _commissionStrategy: ICommissionStrategy,          // Abstract
    private readonly _logger: ILogger                                   // Abstract
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

    // Optimize: In a real scenario, use findAllByIds(ids) instead of a loop
    for (const serviceId of selectedServiceIds) {
      const service = await this._serviceRepo.findById(serviceId);
      
      if (service) {
        const basePrice = service.getBasePrice();
        const name = service.getName();

        // ✅ DELEGATE TO STRATEGY (OCP)
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