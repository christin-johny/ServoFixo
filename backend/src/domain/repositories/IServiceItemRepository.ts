import { ServiceItem, ServiceSpecification } from "../entities/ServiceItem";

export interface ServiceItemQueryParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface ServiceFilters {
  searchTerm?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
}

export interface PaginatedServiceItems {
  data: ServiceItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface IServiceItemRepository {
  create(serviceItem: ServiceItem): Promise<ServiceItem>;
  findAll(params: ServiceItemQueryParams): Promise<PaginatedServiceItems>;
  findById(id: string): Promise<ServiceItem | null>;
  findByNameAndCategory(
    name: string,
    categoryId: string
  ): Promise<ServiceItem | null>;
  update(serviceItem: ServiceItem): Promise<ServiceItem>;
  delete(id: string): Promise<boolean>;
  toggleStatus(id: string, isActive: boolean): Promise<boolean>;
  findMostBooked(limit: number): Promise<ServiceItem[]>;
  findWithFilters(filters: ServiceFilters): Promise<ServiceItem[]>;
}
