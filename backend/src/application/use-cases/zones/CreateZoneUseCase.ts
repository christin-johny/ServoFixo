import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
import { CreateZoneDto } from "../../dto/zone/CreateZoneDto";
import { ZoneResponseDto } from "../../dto/zone/ZoneResponseDto";
import { ZoneMapper } from "../../mappers/ZoneMapper";

export class CreateZoneUseCase {
  constructor(private readonly _zoneRepository: IZoneRepository) {}

  async execute(input: CreateZoneDto): Promise<ZoneResponseDto> {
    const existing = await this._zoneRepository.findByName(input.name);
    if (existing) {
      throw new Error("Zone with this name already exists");
    }

    const newZoneEntity = ZoneMapper.toDomain(input);

    const savedZone = await this._zoneRepository.create(newZoneEntity);

    return ZoneMapper.toResponse(savedZone);
  }
}