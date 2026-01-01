import { IServiceCategoryRepository } from "../../../domain/repositories/IServiceCategoryRepository";
import { IImageService } from "../../interfaces/IImageService";
import { CreateCategoryDto } from "../../dto/category/CreateCategoryDto";
import { CategoryResponseDto } from "../../dto/category/CategoryResponseDto";
import { CategoryMapper } from "../../mappers/CategoryMapper";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export interface IFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export class CreateCategoryUseCase {
  constructor(
    private readonly _categoryRepo: IServiceCategoryRepository,
    private readonly _imageService: IImageService
  ) {}

  async execute(dto: CreateCategoryDto, imageFile?: IFile): Promise<CategoryResponseDto> {
    const existing = await this._categoryRepo.findByName(dto.name);
    if (existing) {
      throw new Error(ErrorMessages.CATEGORY_ALREADY_EXISTS);
    }

    if (!imageFile) {
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