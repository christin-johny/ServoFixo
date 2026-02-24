import {
  IZoneRepository,
  ZoneQueryParams,
} from "../../../domain/repositories/IZoneRepository";
import { PaginatedZonesResponse } from "../../dto/zone/ZoneResponseDto";
import { ZoneMapper } from "../../mappers/ZoneMapper";
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { IGetAllZonesUseCase } from "../../interfaces/use-cases/zone/IZoneUseCases";


export class GetAllZonesUseCase implements IGetAllZonesUseCase {
  constructor(
    private readonly _zoneRepository: IZoneRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(params: ZoneQueryParams): Promise<PaginatedZonesResponse> {
    this._logger.debug(LogEvents.ZONE_GET_ALL_INIT, { params });

    const result = await this._zoneRepository.findAll(params);

    return {
      zones: result.zones.map((z) => ZoneMapper.toResponse(z)),
      total: result.total,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };
  }
}
