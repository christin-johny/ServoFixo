import { ServiceItem, ServiceItemProps } from "../../domain/entities/ServiceItem";
import { CreateServiceItemDto } from "../dto/serviceItem/CreateServiceItemDto";
import { ServiceItemResponseDto } from "../dto/serviceItem/ServiceItemResponseDto";
import { S3UrlHelper } from "../../infrastructure/storage/S3UrlHelper"; //

export class ServiceItemMapper {
  static toDomain(dto: CreateServiceItemDto, imageUrls: string[]): ServiceItem {
    const props: ServiceItemProps = {
      id: '', 
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      specifications: dto.specifications,
      imageUrls: imageUrls, // Store array of KEYS
      isActive: dto.isActive,
      rating: 0,
      reviewCount: 0,
      bookingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return new ServiceItem(props);
  }

  static toResponse(entity: ServiceItem): ServiceItemResponseDto {
    const dto = new ServiceItemResponseDto();
    dto.id = entity.getId();
    dto.categoryId = entity.getCategoryId();
    dto.name = entity.getName();
    dto.description = entity.getDescription();
    dto.basePrice = entity.getBasePrice();
    dto.specifications = entity.getSpecifications(); 
    dto.imageUrls = entity.getImageUrls().map(key => S3UrlHelper.getFullUrl(key));
    
    dto.isActive = entity.getIsActive();
    dto.bookingCount = entity.getBookingCount();
    dto.rating = entity.getRating();
    dto.reviewCount = entity.getReviewCount();
    dto.createdAt = entity.getCreatedAt();
    return dto;
  }
}