import { IServiceCategoryRepository } from '../../../domain/repositories/IServiceCategoryRepository';

export class ToggleCategoryStatusUseCase {
  constructor(private readonly _categoryRepo: IServiceCategoryRepository) {}

  async execute(id: string, isActive: boolean): Promise<void> {
    const success = await this._categoryRepo.toggleStatus(id, isActive);
    if (!success) {
      throw new Error('Category not found or update failed');
    }
  }
}