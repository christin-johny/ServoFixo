import { ServiceCategory } from "../../domain/entities/ServiceCategory";
import { CategoryResponseDto } from "../dto/category/CategoryResponseDto";
import { CreateCategoryDto } from "../dto/category/CreateCategoryDto";

export class CategoryMapper {
  static toDomain(
    dto: CreateCategoryDto,
    iconUrl: string,
    id: string = ""
  ): ServiceCategory {
    return new ServiceCategory({
      id: id,
      name: dto.name,
      description: dto.description,
      iconUrl: iconUrl,
      isActive: dto.isActive,
      isDeleted: false,
    });
  }

  static toResponse(entity: ServiceCategory): CategoryResponseDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      description: entity.getDescription(),
      iconUrl: entity.getIconUrl(),
      isActive: entity.getIsActive(),
      createdAt: entity.getCreatedAt().toISOString(),
      updatedAt: entity.getUpdatedAt().toISOString(),
    };
  }
}