import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
import { UpdateZoneDto } from "../../dto/zone/UpdateZoneDto";
import { ZoneResponseDto } from "../../dto/zone/ZoneResponseDto";
import { ZoneMapper } from "../../mappers/ZoneMapper";
import { Zone } from "../../../domain/entities/Zone";

export class EditZoneUseCase {
  constructor(private readonly _zoneRepository: IZoneRepository) {}

  async execute(id: string, input: UpdateZoneDto): Promise<ZoneResponseDto> {
    const existingZone = await this._zoneRepository.findById(id);
    if (!existingZone) {
      throw new Error("Zone not found");
    }

    // Name Duplicate Check
    if (input.name && input.name !== existingZone.getName()) {
      const duplicate = await this._zoneRepository.findByName(input.name);
      if (duplicate) {
        throw new Error("Zone with this name already exists");
      }
    }

    // Immutable Update using Props
    const updatedEntity = new Zone({
      ...existingZone.toProps(),
      ...input,
      updatedAt: new Date()
    });

    const savedZone = await this._zoneRepository.update(updatedEntity);
    return ZoneMapper.toResponse(savedZone);
  }
}