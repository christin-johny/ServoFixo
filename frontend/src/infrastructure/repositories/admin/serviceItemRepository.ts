import api from "../../api/axiosClient";
import type { ServiceItem } from "../../../domain/types/ServiceItem";

export interface ServiceQueryParams {
  page: number;
  limit: number;
  categoryId: string; // Required! We always fetch services FOR a category
  search?: string;
  isActive?: string;
}

export interface PaginatedServices {
  data: ServiceItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const getServices = async (params: ServiceQueryParams): Promise<PaginatedServices> => {
  const response = await api.get("/api/admin/services", { params });
  return response.data;
};

export const createService = async (formData: FormData): Promise<ServiceItem> => {
  const response = await api.post("/api/admin/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.serviceItem;
};

export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/services/${id}`);
};

export const updateService = async (id: string, formData: FormData): Promise<ServiceItem> => {
  const response = await api.put(`/api/admin/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.serviceItem;
};