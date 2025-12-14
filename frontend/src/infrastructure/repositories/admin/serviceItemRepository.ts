import api from "../../api/axiosClient";
import type { ServiceItem } from "../../../domain/types/ServiceItem";

export interface ServiceQueryParams {
  page: number;
  limit: number;
  categoryId: string;
  search?: string;
  isActive?: string;
}

export interface PaginatedServices {
  data: ServiceItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const getServices = async (
  params: ServiceQueryParams
): Promise<PaginatedServices> => {
  const response = await api.get("/admin/services", { params });
  return response.data;
};

export const createService = async (
  formData: FormData
): Promise<ServiceItem> => {
  const response = await api.post("/admin/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.serviceItem;
};

export const updateService = async (
  id: string,
  formData: FormData
): Promise<ServiceItem> => {
  const response = await api.put(`/admin/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.serviceItem;
};

export const toggleServiceStatus = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  await api.patch(`/admin/services/${id}/toggle`, { isActive });
};

export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/admin/services/${id}`);
};
