import { ServiceCategory } from "../../domain/entities/ServiceCategory";
import { CategoryResponseDto } from "../dto/category/CategoryResponseDto";
import { CreateCategoryDto } from "../dto/category/CreateCategoryDto";
import { S3UrlHelper } from "../../infrastructure/storage/S3UrlHelper"; //

export class CategoryMapper {
  // toDomain stays the same: it receives the raw KEY from the upload service
  static toDomain(dto: CreateCategoryDto, iconUrl: string, id: string = ""): ServiceCategory {
    return new ServiceCategory({
      id: id,
      name: dto.name,
      description: dto.description,
      iconUrl: iconUrl, // KEY (e.g., "categories/plumbing.png")
      isActive: dto.isActive,
      isDeleted: false,
    });
  }

  static toResponse(entity: ServiceCategory): CategoryResponseDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      description: entity.getDescription(),
      // RESOLVE URL: Wrap the stored key with the helper
      iconUrl: S3UrlHelper.getFullUrl(entity.getIconUrl()), 
      isActive: entity.getIsActive(),
      createdAt: entity.getCreatedAt().toISOString(),
      updatedAt: entity.getUpdatedAt().toISOString(),
    };
  }
}