import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
import { Zone } from "../../../domain/entities/Zone";

export interface CreateZoneDto {
  name: string;
  description?: string;
  boundaries: { lat: number; lng: number }[];
  isActive?: boolean;
}

export class CreateZoneUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(input: CreateZoneDto): Promise<Zone> {
    const { name, description, boundaries, isActive } = input;

    const existing = await this.zoneRepository.findByName(name);
    if (existing) {
      throw new Error("Zone with this name already exists");
    }

    const newZone = new Zone(
      "",
      name,
      description || "",
      boundaries,
      isActive !== undefined ? isActive : true,
      {}, // additionalInfo
      new Date(),
      new Date(),
      false // 🟢 isDeleted
    );

    return this.zoneRepository.create(newZone);
  }
}
