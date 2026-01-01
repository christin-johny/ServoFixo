import { IServiceCategoryRepository, CategoryQueryParams } from '../../../domain/repositories/IServiceCategoryRepository';
import { CategoryResponseDto } from '../../dto/category/CategoryResponseDto';
import { CategoryMapper } from '../../mappers/CategoryMapper';

export interface PaginatedCategoriesResponse {
  categories: CategoryResponseDto[]; 
  total: number;
  currentPage: number;
  totalPages: number;
}

export class GetAllCategoriesUseCase {
  constructor(private readonly _categoryRepo: IServiceCategoryRepository) {}

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