import { IServiceCategoryRepository } from '../../../domain/repositories/IServiceCategoryRepository';

export class DeleteCategoryUseCase {
  constructor(
    private readonly _categoryRepo: IServiceCategoryRepository,

  ) {}

  async execute(id: string): Promise<void> {
    const category = await this._categoryRepo.findById(id);
    if (!category) throw new Error('Category not found');

    await this._categoryRepo.delete(id);
  }
}