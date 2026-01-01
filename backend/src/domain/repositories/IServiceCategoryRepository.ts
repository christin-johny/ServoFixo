import { ServiceCategory } from "../entities/ServiceCategory";
import { IBaseRepository } from "./IBaseRepository";

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

export interface IServiceCategoryRepository extends IBaseRepository<ServiceCategory> {
  // create(category: ServiceCategory): Promise<ServiceCategory>;
  // delete(id: string): Promise<boolean>;
  // update(category: ServiceCategory): Promise<ServiceCategory>;
  // findById(id: string): Promise<ServiceCategory | null>;

  findAll(params: CategoryQueryParams): Promise<PaginatedCategories>;

  findByName(name: string): Promise<ServiceCategory | null>;

  toggleStatus(id: string, isActive: boolean): Promise<boolean>;
}
