import api from "../../../lib/axiosClient";
import { CUSTOMER_SERVICE_ENDPOINTS } from "./endpoints";
import type { ServiceItem } from "../types/ServiceItem";

export interface ServiceFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
}

export const getServices = async (
  filters: ServiceFilters
): Promise<ServiceItem[]> => {
  const response = await api.get(CUSTOMER_SERVICE_ENDPOINTS.SERVICES, {
    params: filters,
  });

  return response.data.data;
};

export const getServiceById = async (id: string): Promise<ServiceItem> => {
  const response = await api.get(CUSTOMER_SERVICE_ENDPOINTS.SERVICE_BY_ID(id));

  return response.data.data;
};
