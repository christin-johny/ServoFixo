import { ServiceCategory } from "../entities/ServiceCategory";

export interface CategoryQueryParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedCategories {
  categories: ServiceCategory[]; 
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface IServiceCategoryRepository {
  create(category: ServiceCategory): Promise<ServiceCategory>;
  findAll(params: CategoryQueryParams): Promise<PaginatedCategories>;
  findById(id: string): Promise<ServiceCategory | null>;
  findByName(name: string): Promise<ServiceCategory | null>;
  update(category: ServiceCategory): Promise<ServiceCategory>;
  delete(id: string): Promise<boolean>;
  toggleStatus(id: string, isActive: boolean): Promise<boolean>;
}