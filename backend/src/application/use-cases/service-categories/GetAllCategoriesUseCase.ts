import { IServiceCategoryRepository, CategoryQueryParams, PaginatedCategories } from '../../../domain/repositories/IServiceCategoryRepository';

export class GetAllCategoriesUseCase {
  constructor(private readonly categoryRepo: IServiceCategoryRepository) {}

  async execute(params: CategoryQueryParams): Promise<PaginatedCategories> {
    return this.categoryRepo.findAll(params);
  }
}