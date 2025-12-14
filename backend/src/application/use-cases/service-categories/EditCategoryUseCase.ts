import { IServiceCategoryRepository } from '../../../domain/repositories/IServiceCategoryRepository';
import { IImageService } from '../../services/IImageService';
import { ServiceCategory } from '../../../domain/entities/ServiceCategory';

interface EditCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  imageFile?: { buffer: Buffer; originalName: string; mimeType: string };
  isActive?: boolean;
}

export class EditCategoryUseCase {
  constructor(
    private readonly categoryRepo: IServiceCategoryRepository,
    private readonly imageService: IImageService
  ) {}

  async execute(request: EditCategoryRequest): Promise<ServiceCategory> {
    const category = await this.categoryRepo.findById(request.id);
    if (!category) throw new Error('Category not found');

    if (request.name && request.name !== category.getName()) {
      const existing = await this.categoryRepo.findByName(request.name);
      if (existing) throw new Error('Category with this name already exists');
    }

    if (request.imageFile) {
      const newUrl = await this.imageService.uploadImage(
        request.imageFile.buffer,
        request.imageFile.originalName,
        request.imageFile.mimeType
      );

      if (category.getIconUrl()) {
        await this.imageService.deleteImage(category.getIconUrl());
      }

      category.updateIcon(newUrl);
    }

    category.updateDetails(
      request.name || category.getName(),
      request.description || category.getDescription(),
      request.isActive !== undefined ? request.isActive : category.getIsActive()
    );

    return this.categoryRepo.update(category);
  }
}