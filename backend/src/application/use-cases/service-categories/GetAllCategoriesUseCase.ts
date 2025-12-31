import { IServiceCategoryRepository, CategoryQueryParams, PaginatedCategories } from '../../../domain/repositories/IServiceCategoryRepository';

export class GetAllCategoriesUseCase {
  constructor(private readonly _categoryRepo: IServiceCategoryRepository) {}

  async execute(params: CategoryQueryParams): Promise<PaginatedCategories> {
    return this._categoryRepo.findAll(params);
  }
}