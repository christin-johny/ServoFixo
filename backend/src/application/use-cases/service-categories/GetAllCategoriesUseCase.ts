import { IServiceCategoryRepository, CategoryQueryParams } from '../../../domain/repositories/IServiceCategoryRepository';
import { PaginatedCategoriesResponse } from '../../dto/category/CategoryResponseDto';
import { IGetAllCategoriesUseCase } from '../../interfaces/use-cases/category/ICategoryUseCases';
import { CategoryMapper } from '../../mappers/CategoryMapper';

 

export class GetAllCategoriesUseCase implements IGetAllCategoriesUseCase{
  constructor(
    private readonly _categoryRepo: IServiceCategoryRepository
  ) {}

  async execute(params: CategoryQueryParams): Promise<PaginatedCategoriesResponse> {    
    const result = await this._categoryRepo.findAll(params);
    
    return {
      categories: result.categories.map(c => CategoryMapper.toResponse(c)),
      total: result.total,
      currentPage: result.currentPage,
      totalPages: result.totalPages
    };
  }
}