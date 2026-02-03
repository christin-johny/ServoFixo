import { ServiceItem } from "../entities/ServiceItem";
import { IBaseRepository } from "./IBaseRepository";

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

export interface IServiceItemRepository extends IBaseRepository<ServiceItem> {
  // create(serviceItem: ServiceItem): Promise<ServiceItem>;
  // findById(id: string): Promise<ServiceItem | null>;
  // update(serviceItem: ServiceItem): Promise<ServiceItem>;
  // delete(id: string): Promise<boolean>;

  findAll(params: ServiceItemQueryParams): Promise<PaginatedServiceItems>;

  findByNameAndCategory(
    name: string,
    categoryId: string
  ): Promise<ServiceItem | null>;

  toggleStatus(id: string, isActive: boolean): Promise<boolean>;
  findMostBooked(limit: number): Promise<ServiceItem[]>;
  findWithFilters(filters: ServiceFilters): Promise<ServiceItem[]>;
  addRating(id: string, rating: number): Promise<void>;
  incrementBookingCount(id: string): Promise<void>;
}
