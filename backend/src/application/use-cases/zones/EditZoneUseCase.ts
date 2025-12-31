import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
import { Zone } from "../../../domain/entities/Zone";

export interface EditZoneDto {
  id: string;
  name?: string;
  description?: string;
  boundaries?: { lat: number; lng: number }[];
  isActive?: boolean;
}

export class EditZoneUseCase {
  constructor(private readonly _zoneRepository: IZoneRepository) {}

  async execute(input: EditZoneDto): Promise<Zone> {
    const { id, name, description, boundaries, isActive } = input;

    const existingZone = await this._zoneRepository.findById(id);
    if (!existingZone) {
      throw new Error("Zone not found");
    }

    if (name && name !== existingZone.getName()) {
      const duplicate = await this._zoneRepository.findByName(name);
      if (duplicate) {
        throw new Error("Zone with this name already exists");
      }
    }

    const updatedZone = new Zone(
      id,
      name || existingZone.getName(),
      description || existingZone.getDescription(),
      boundaries || existingZone.getBoundaries(),
      isActive !== undefined ? isActive : existingZone.getIsActive(),
      existingZone.getAdditionalInfo(),
      existingZone.getCreatedAt(),
      new Date(),
      existingZone.getIsDeleted() 
    );

    return this._zoneRepository.update(updatedZone);
  }
}
