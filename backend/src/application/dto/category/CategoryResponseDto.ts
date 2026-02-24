export class CategoryResponseDto {
  id!: string;
  name!: string;
  description!: string;
  iconUrl!: string;
  isActive!: boolean;
  createdAt!: string; 
  updatedAt!: string;
}

export interface PaginatedCategoriesResponse {
  categories: CategoryResponseDto[]; 
  total: number;
  currentPage: number;
  totalPages: number;
}