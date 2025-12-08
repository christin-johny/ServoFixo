import { IZoneRepository, ZoneQueryParams, PaginatedZones } from '../../../domain/repositories/IZoneRepository';

export class GetAllZonesUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(params: ZoneQueryParams): Promise<PaginatedZones> {
    return this.zoneRepository.findAll(params);
  }
}