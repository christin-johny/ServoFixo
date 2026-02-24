import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
import { CreateZoneDto } from "../../dto/zone/CreateZoneDto";
import { ZoneResponseDto } from "../../dto/zone/ZoneResponseDto";
import { ZoneMapper } from "../../mappers/ZoneMapper";
import { ILogger } from "../../interfaces/services/ILogger";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { ICreateZoneUseCase } from "../../interfaces/use-cases/zone/IZoneUseCases";

export class CreateZoneUseCase  implements ICreateZoneUseCase{
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