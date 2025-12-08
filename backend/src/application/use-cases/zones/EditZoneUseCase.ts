import { IZoneRepository } from '../../../domain/repositories/IZoneRepository';
import { Zone } from '../../../domain/entities/Zone';

export interface EditZoneDto {
  id: string;
  name?: string;
  description?: string;
  boundaries?: { lat: number; lng: number }[];
  isActive?: boolean;
}

export class EditZoneUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(input: EditZoneDto): Promise<Zone> {
    const { id, name, description, boundaries, isActive } = input;

    // 1. Find existing zone
    const existingZone = await this.zoneRepository.findById(id);
    if (!existingZone) {
      throw new Error('Zone not found');
    }

    // 2. Check name uniqueness (if name changed)
    if (name && name !== existingZone.getName()) {
      const duplicate = await this.zoneRepository.findByName(name);
      if (duplicate) {
        throw new Error('Zone with this name already exists');
      }
    }

    // 3. Create updated entity
    // We keep existing values if new ones aren't provided
    const updatedZone = new Zone(
      id,
      name || existingZone.getName(),
      description || existingZone.getDescription(),
      boundaries || existingZone.getBoundaries(),
      isActive !== undefined ? isActive : existingZone.getIsActive(),
      existingZone.getAdditionalInfo(), // Preserve additional info
      existingZone.getCreatedAt(),
      new Date() // Update updatedAt
    );

    // 4. Save
    return this.zoneRepository.update(updatedZone);
  }
}