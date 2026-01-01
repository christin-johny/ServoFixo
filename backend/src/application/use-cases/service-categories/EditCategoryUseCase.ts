import { IServiceCategoryRepository } from "../../../domain/repositories/IServiceCategoryRepository";
import { IImageService } from "../../interfaces/IImageService";
import { UpdateCategoryDto } from "../../dto/category/UpdateCategoryDto";
import { CategoryResponseDto } from "../../dto/category/CategoryResponseDto";
import { ServiceCategory } from "../../../domain/entities/ServiceCategory";
import { CategoryMapper } from "../../mappers/CategoryMapper";
import { IFile } from "./CreateCategoryUseCase";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class EditCategoryUseCase {
  constructor(
    private readonly _categoryRepo: IServiceCategoryRepository,
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(
    id: string,
    dto: UpdateCategoryDto,
    imageFile?: IFile
  ): Promise<CategoryResponseDto> {
    this._logger.info(`${LogEvents.CATEGORY_UPDATE_INIT} - ID: ${id}`);

    const existingCategory = await this._categoryRepo.findById(id);
    if (!existingCategory) {
      this._logger.error(
        `${LogEvents.CATEGORY_UPDATE_FAILED} - ${LogEvents.CATEGORY_NOT_FOUND} - ID: ${id}`
      );
      throw new Error(ErrorMessages.CATEGORY_NOT_FOUND);
    }

    if (dto.name && dto.name !== existingCategory.getName()) {
      const duplicate = await this._categoryRepo.findByName(dto.name);
      if (duplicate) {
        this._logger.warn(
          `${LogEvents.CATEGORY_UPDATE_FAILED} - ${LogEvents.CATEGORY_ALREADY_EXISTS} - Name: ${dto.name}`
        );
        throw new Error(ErrorMessages.CATEGORY_ALREADY_EXISTS);
      }
    }

    let iconUrl = existingCategory.getIconUrl();

    if (imageFile) {
      this._logger.info(
        `${LogEvents.CATEGORY_UPDATE_INIT} - Uploading new image`
      );
      const newUrl = await this._imageService.uploadImage(
        imageFile.buffer,
        imageFile.originalName,
        imageFile.mimeType
      );

      if (iconUrl) {
        try {
          await this._imageService.deleteImage(iconUrl);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          this._logger.error(
            LogEvents.CATEGORY_IMAGE_DELETE_FAILED,
            errorMessage
          );
        }
      }

      iconUrl = newUrl;
    }

    const updatedEntity = new ServiceCategory({
      ...existingCategory.toProps(),
      name: dto.name || existingCategory.getName(),
      description: dto.description || existingCategory.getDescription(),
      isActive:
        dto.isActive !== undefined
          ? dto.isActive
          : existingCategory.getIsActive(),
      iconUrl: iconUrl,
      updatedAt: new Date(),
    });

    const saved = await this._categoryRepo.update(updatedEntity);
    this._logger.info(`${LogEvents.CATEGORY_UPDATED} - ID: ${id}`);
    return CategoryMapper.toResponse(saved);
  }
}
