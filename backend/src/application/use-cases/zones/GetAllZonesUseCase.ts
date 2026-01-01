import { IZoneRepository, ZoneQueryParams } from '../../../domain/repositories/IZoneRepository';
import { ZoneResponseDto } from '../../dto/zone/ZoneResponseDto';
import { ZoneMapper } from '../../mappers/ZoneMapper';

export interface PaginatedZonesResponse {
  zones: ZoneResponseDto[];
  total: number;
  // ADDED: Pagination metadata
  currentPage: number;
  totalPages: number;
}

export class GetAllZonesUseCase {
  constructor(private readonly _zoneRepository: IZoneRepository) {}

  async execute(params: ZoneQueryParams): Promise<PaginatedZonesResponse> {
    const result = await this._zoneRepository.findAll(params);
    
    return {
      // Map Entities to DTOs
      zones: result.zones.map(z => ZoneMapper.toResponse(z)),
      total: result.total,
      // Pass through metadata
      currentPage: result.currentPage,
      totalPages: result.totalPages
    };
  }
}