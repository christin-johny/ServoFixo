import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
import { CreateZoneDto } from "../../dto/zone/CreateZoneDto";
import { ZoneResponseDto } from "../../dto/zone/ZoneResponseDto";
import { ZoneMapper } from "../../mappers/ZoneMapper";
import { ILogger } from "../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class CreateZoneUseCase {
  constructor(
    private readonly _zoneRepository: IZoneRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(input: CreateZoneDto): Promise<ZoneResponseDto> {
    const existing = await this._zoneRepository.findByName(input.name);
    if (existing) {
      this._logger.warn(LogEvents.ZONE_ALREADY_EXISTS, { name: input.name });
      throw new Error(ErrorMessages.ZONE_ALREADY_EXISTS);
    }

    const newZoneEntity = ZoneMapper.toDomain(input);
    const savedZone = await this._zoneRepository.create(newZoneEntity);
    

    return ZoneMapper.toResponse(savedZone);
  }
}