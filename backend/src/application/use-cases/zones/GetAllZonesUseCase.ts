import { IZoneRepository, ZoneQueryParams, PaginatedZones } from '../../../domain/repositories/IZoneRepository';

export class GetAllZonesUseCase {
  constructor(private readonly _zoneRepository: IZoneRepository) {}

  async execute(params: ZoneQueryParams): Promise<PaginatedZones> {
    return this._zoneRepository.findAll(params);
  }
}