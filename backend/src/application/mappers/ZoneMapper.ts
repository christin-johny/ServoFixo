import { Zone } from "../../domain/entities/Zone";
import { CreateZoneDto } from "../dto/zone/CreateZoneDto";
import { ZoneResponseDto } from "../dto/zone/ZoneResponseDto";

export class ZoneMapper {
  static toDomain(dto: CreateZoneDto, id: string = ""): Zone {
    return new Zone({
      id: id,
      name: dto.name,
      description: dto.description || "",
      boundaries: dto.boundaries,
      isActive: dto.isActive ?? true,
      additionalInfo: {},
      isDeleted: false,
    });
  }

  static toResponse(entity: Zone): ZoneResponseDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      description: entity.getDescription(),
      boundaries: entity.getBoundaries(),
      isActive: entity.getIsActive(),
      createdAt: entity.getCreatedAt().toISOString(),
      updatedAt: entity.getUpdatedAt().toISOString(),
    };
  }
}
