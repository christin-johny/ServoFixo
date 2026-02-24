import { IUseCase } from "../../../interfaces/services/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IServiceCategoryRepository } from "../../../../domain/repositories/IServiceCategoryRepository";
import { IServiceItemRepository } from "../../../../domain/repositories/IServiceItemRepository";
import { IZoneRepository } from "../../../../domain/repositories/IZoneRepository";
import { ILogger } from "../../../interfaces/services/ILogger"; 
import { TechnicianResponseDto } from "../../../dto/technician/TechnicianResponseDto";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";
import { S3UrlHelper } from "../../../../infrastructure/storage/S3UrlHelper";

export class GetTechnicianProfileUseCase
  implements IUseCase<TechnicianResponseDto | null, [string]>
{
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _categoryRepository: IServiceCategoryRepository,
    private readonly _serviceRepository: IServiceItemRepository,
    private readonly _zoneRepository: IZoneRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string): Promise<TechnicianResponseDto | null> {
  const tech = await this._technicianRepository.findById(technicianId);
  if (!tech) return null;
 
  const [categories, subServices, zones] = await Promise.all([
    Promise.all(tech.getCategoryIds().map(id => this._categoryRepository.findById(id))),
    Promise.all(tech.getSubServiceIds().map(id => this._serviceRepository.findById(id))),
    Promise.all(tech.getZoneIds().map(id => this._zoneRepository.findById(id)))
  ]);
 
  const baseProfile = await TechnicianMapper.toResponse(tech);

  // 3. Add the hydrated relation data to the response
  return {
    ...baseProfile,
    categories: categories.filter(c => c !== null).map(c => ({
      id: c!.getId(),
      name: c!.getName(),
      iconUrl: S3UrlHelper.getFullUrl(c!.getIconUrl()), // Ensure category icons are resolved
    })),
    subServices: subServices.filter(s => s !== null).map(s => ({
      id: s!.getId(),
      name: s!.getName(),
      categoryId: s!.getCategoryId(),
    })),
    serviceZones: zones.filter(z => z !== null).map(z => ({
      id: z!.getId(),
      name: z!.getName(),
    })),
  };
}
}
