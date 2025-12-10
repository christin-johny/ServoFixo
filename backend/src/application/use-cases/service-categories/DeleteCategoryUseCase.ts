import { IServiceCategoryRepository } from '../../../domain/repositories/IServiceCategoryRepository';

export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepo: IServiceCategoryRepository,

  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new Error('Category not found');

    await this.categoryRepo.delete(id);
  }
}