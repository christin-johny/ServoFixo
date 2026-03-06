import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { IImageService } from "../../interfaces/services/IImageService"; 
import { EditServiceRequest, ServiceItemResponseDto } from "../../dto/serviceItem/ServiceItemResponseDto";
import { ServiceItem } from "../../../domain/entities/ServiceItem";
import { ServiceItemMapper } from "../../mappers/ServiceItemMapper";
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { ErrorMessages } from "../../constants/ErrorMessages"; 
import { IEditServiceItemUseCase } from "../../interfaces/use-cases/serviceItem/IServiceItemUseCases";



export class EditServiceItemUseCase implements IEditServiceItemUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(request: EditServiceRequest): Promise<ServiceItemResponseDto> {
    const existingService = await this._serviceRepo.findById(request.id);
    if (!existingService) {
      this._logger.error(
        `${LogEvents.SERVICE_UPDATE_FAILED} - ${LogEvents.SERVICE_NOT_FOUND}`
      );
      throw new Error(ErrorMessages.SERVICE_NOT_FOUND);
    }

    let currentImages = [...existingService.getImageUrls()];

    // FIX: Remove images from the array FIRST to prevent broken links in DB
    if (request.imagesToDelete && request.imagesToDelete.length > 0) {
      const toDelete = request.imagesToDelete;
      
      // Update the array once globally instead of inside the loop
      currentImages = currentImages.filter((img) => !toDelete.includes(img));

      // Execute S3 deletions
      const deletePromises = toDelete.map(async (url) => {
        try {
          await this._imageService.deleteImage(url);
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          this._logger.error(
            LogEvents.SERVICE_IMAGE_DELETE_FAILED,
            errorMessage
          );
        }
      });
      await Promise.all(deletePromises);
    }

    if (request.newImageFiles && request.newImageFiles.length > 0) {
      const uploadPromises = request.newImageFiles.map((file) =>
        this._imageService.uploadImage(
          file.buffer,
          file.originalName,
          file.mimeType
        )
      );
      const newUrls = await Promise.all(uploadPromises);
      currentImages = [...currentImages, ...newUrls];
    }
 
    const updatedEntity = new ServiceItem({
      ...existingService.toProps(),
      categoryId: request.dto.categoryId || existingService.getCategoryId(),
      name: request.dto.name || existingService.getName(),
      description: request.dto.description || existingService.getDescription(),
      basePrice:
        request.dto.basePrice !== undefined
          ? request.dto.basePrice
          : existingService.getBasePrice(),
      specifications:
        request.dto.specifications || existingService.getSpecifications(),
      isActive:
        request.dto.isActive !== undefined
          ? request.dto.isActive
          : existingService.getIsActive(),
      imageUrls: currentImages,
      updatedAt: new Date(),
    });

    const savedService = await this._serviceRepo.update(updatedEntity);
    
    return ServiceItemMapper.toResponse(savedService);
  }
}