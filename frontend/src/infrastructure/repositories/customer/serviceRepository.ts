import api from "../../api/axiosClient";
import type { ServiceItem } from "../../../domain/types/ServiceItem";

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
  const response = await api.get("/customer/services", {
    params: filters,
  });
  console.log(response.data)
  return response.data.data;
};

export const getServiceById = async (id: string): Promise<ServiceItem> => {
  const response = await api.get(`/customer/services/${id}`);

  return response.data.data;
};


