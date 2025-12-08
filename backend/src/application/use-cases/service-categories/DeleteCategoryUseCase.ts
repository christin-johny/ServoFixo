import { IServiceCategoryRepository } from '../../../domain/repositories/IServiceCategoryRepository';
import { IImageService } from '../../services/IImageService';

export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepo: IServiceCategoryRepository,
    private readonly imageService: IImageService
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new Error('Category not found');

    // 1. Delete image from S3
    if (category.getIconUrl()) {
      await this.imageService.deleteImage(category.getIconUrl());
    }

    // 2. Delete from DB
    await this.categoryRepo.delete(id);
  }
}