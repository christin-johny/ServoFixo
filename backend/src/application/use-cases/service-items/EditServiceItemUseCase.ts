import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { IImageService } from "../../interfaces/IImageService";
import { UpdateServiceItemDto } from "../../dto/serviceItem/UpdateServiceItemDto";
import { ServiceItemResponseDto } from "../../dto/serviceItem/ServiceItemResponseDto";
import { ServiceItem } from "../../../domain/entities/ServiceItem";
import { ServiceItemMapper } from "../../mappers/ServiceItemMapper";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { IFile } from "./CreateServiceItemUseCase";

interface EditServiceRequest {
  id: string;
  dto: UpdateServiceItemDto;
  newImageFiles: IFile[];
  imagesToDelete?: string[];
}

export class EditServiceItemUseCase {
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

    if (request.imagesToDelete && request.imagesToDelete.length > 0) {
      const deletePromises = request.imagesToDelete.map(async (url) => {
        try {
          await this._imageService.deleteImage(url);
          currentImages = currentImages.filter((img) => img !== url);
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

    if (request.newImageFiles.length > 0) {
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
