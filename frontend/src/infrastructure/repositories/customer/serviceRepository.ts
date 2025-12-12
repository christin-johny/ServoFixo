import api from "../../api/axiosClient";
import type { ServiceItem } from "../../../domain/types/ServiceItem";

// Define the Filter Interface (matches what Backend expects)
export interface ServiceFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number; 
  limit?: number;
}

/**
 * Fetches services with advanced filtering.
 * Endpoint: GET /api/customer/services?categoryId=...&sort=...
 */
export const getServices = async (filters: ServiceFilters): Promise<ServiceItem[]> => {
  // Axios automatically converts this object into query string parameters
  // e.g. /services?categoryId=123&sort=price_asc
  const response = await api.get("/api/customer/services", {
    params: filters,
  });
  
  return response.data.data;
};
