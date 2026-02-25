import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
import { UpdateZoneDto } from "../../dto/zone/UpdateZoneDto";
import { ZoneResponseDto } from "../../dto/zone/ZoneResponseDto";
import { ZoneMapper } from "../../mappers/ZoneMapper";
import { Zone } from "../../../domain/entities/Zone";
import { ILogger } from "../../interfaces/services/ILogger";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { IEditZoneUseCase } from "../../interfaces/use-cases/zone/IZoneUseCases";

export class EditZoneUseCase implements IEditZoneUseCase{
  constructor(
    private readonly _zoneRepository: IZoneRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string, input: UpdateZoneDto): Promise<ZoneResponseDto> {
    const existingZone = await this._zoneRepository.findById(id);
    if (!existingZone) {
      this._logger.warn(LogEvents.ZONE_NOT_FOUND, { id });
      throw new Error(ErrorMessages.ZONE_NOT_FOUND);
    }

    if (input.name && input.name !== existingZone.getName()) {
      const duplicate = await this._zoneRepository.findByName(input.name);
      if (duplicate) {
        this._logger.warn(LogEvents.ZONE_ALREADY_EXISTS, { name: input.name });
        throw new Error(ErrorMessages.ZONE_ALREADY_EXISTS);
      }
    }

    const updatedEntity = new Zone({
      ...existingZone.toProps(),
      ...input,
      updatedAt: new Date()
    });

    const savedZone = await this._zoneRepository.update(updatedEntity);
    
    
    return ZoneMapper.toResponse(savedZone);
  }
}