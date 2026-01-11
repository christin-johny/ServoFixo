import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IZoneRepository } from "../../../../domain/repositories/IZoneRepository"; 
import { IServiceCategoryRepository } from "../../../../domain/repositories/IServiceCategoryRepository"; 
import { IServiceItemRepository } from "../../../../domain/repositories/IServiceItemRepository"; 
import { IUseCase } from "../../../interfaces/IUseCase";
import { AdminTechnicianProfileDto } from "../../../dto/technician/TechnicianVerificationDtos";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

import { Zone } from "../../../../domain/entities/Zone";
import { ServiceCategory } from "../../../../domain/entities/ServiceCategory";
import { ServiceItem } from "../../../../domain/entities/ServiceItem";

export class GetTechnicianFullProfileUseCase
  implements IUseCase<AdminTechnicianProfileDto, [string]>
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _zoneRepo: IZoneRepository,       
    private readonly _categoryRepo: IServiceCategoryRepository, 
    private readonly _serviceRepo: IServiceItemRepository,   
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string): Promise<AdminTechnicianProfileDto> {
    const tech = await this._technicianRepo.findById(technicianId);

    if (!tech) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }

    const baseProfile = TechnicianMapper.toAdminProfile(tech);

    const [zones, categories, subServices]: [
        (Zone | null)[], 
        (ServiceCategory | null)[], 
        (ServiceItem | null)[]
    ] = await Promise.all([
      Promise.all(tech.getZoneIds().map((id) => this._zoneRepo.findById(id))),
      Promise.all(tech.getCategoryIds().map((id) => this._categoryRepo.findById(id))),
      Promise.all(tech.getSubServiceIds().map((id) => this._serviceRepo.findById(id)))
    ]);

    const zoneNames = zones
        .filter((z): z is Zone => z !== null)
        .map((z) => z.getName());

    const categoryNames = categories
        .filter((c): c is ServiceCategory => c !== null)
        .map((c) => c.getName());

    const subServiceNames = subServices
        .filter((s): s is ServiceItem => s !== null)
        .map((s) => s.getName());

    return {
      ...baseProfile,
      bio: tech.getBio(),
      zoneNames,
      categoryNames,
      subServiceNames,
    };
  }
}