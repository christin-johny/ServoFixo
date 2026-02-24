import { IServiceCategoryRepository } from "../../../domain/repositories/IServiceCategoryRepository";
import { IImageService } from "../../interfaces/services/IImageService";
import { CreateCategoryDto } from "../../dto/category/CreateCategoryDto";
import { CategoryResponseDto } from "../../dto/category/CategoryResponseDto";
import { CategoryMapper } from "../../mappers/CategoryMapper";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { IFile } from "../../dto/file/FileDto";
import { ICreateCategoryUseCase } from "../../interfaces/use-cases/category/ICategoryUseCases";


export class CreateCategoryUseCase implements ICreateCategoryUseCase {
  constructor(
    private readonly _categoryRepo: IServiceCategoryRepository,
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(dto: CreateCategoryDto, imageFile?: IFile): Promise<CategoryResponseDto> {
    const existing = await this._categoryRepo.findByName(dto.name);
    if (existing) {
      this._logger.warn(`${LogEvents.CATEGORY_CREATE_FAILED} - ${LogEvents.CATEGORY_ALREADY_EXISTS} - Name: ${dto.name}`);
      throw new Error(ErrorMessages.CATEGORY_ALREADY_EXISTS);
    }

    if (!imageFile) {
      this._logger.error(`${LogEvents.CATEGORY_CREATE_FAILED} - Image required`);
      throw new Error("Category icon/image is required");
    }

    const iconUrl = await this._imageService.uploadImage(
      imageFile.buffer,
      imageFile.originalName,
      imageFile.mimeType
    );
    

    const newCategory = CategoryMapper.toDomain(dto, iconUrl);

    const savedCategory = await this._categoryRepo.create(newCategory);
    
    
    return CategoryMapper.toResponse(savedCategory);
  }
}