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

    // 1. Check Name Uniqueness if changing name
    if (request.name && request.name !== category.getName()) {
      const existing = await this.categoryRepo.findByName(request.name);
      if (existing) throw new Error('Category with this name already exists');
    }

    // 2. Handle Image Update (If a new file is provided)
    if (request.imageFile) {
      // A. Upload new image
      const newUrl = await this.imageService.uploadImage(
        request.imageFile.buffer,
        request.imageFile.originalName,
        request.imageFile.mimeType
      );

      // B. Delete old image from S3 (Cleanup)
      if (category.getIconUrl()) {
        await this.imageService.deleteImage(category.getIconUrl());
      }

      // C. Update Entity
      category.updateIcon(newUrl);
    }

    // 3. Update Text Details
    category.updateDetails(
      request.name || category.getName(),
      request.description || category.getDescription(),
      request.isActive !== undefined ? request.isActive : category.getIsActive()
    );

    return this.categoryRepo.update(category);
  }
}