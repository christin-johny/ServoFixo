import { ServiceItem, ServiceSpecification } from "../entities/ServiceItem";

export interface ServiceItemQueryParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string; // Optional: If provided, only fetch items for this category
  isActive?: boolean;
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
}
