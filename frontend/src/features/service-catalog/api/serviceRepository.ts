import api from "../../../lib/axiosClient";
import { ADMIN_SERVICE_ENDPOINTS } from "./endpoints";
import type { ServiceItem } from "../types/ServiceItem";

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
  const response = await api.get(ADMIN_SERVICE_ENDPOINTS.SERVICES, { params });
  return response.data;
};

export const createService = async (
  formData: FormData
): Promise<ServiceItem> => {
  const response = await api.post(ADMIN_SERVICE_ENDPOINTS.SERVICES, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.serviceItem;
};

export const updateService = async (
  id: string,
  formData: FormData
): Promise<ServiceItem> => {
  const response = await api.put(
    ADMIN_SERVICE_ENDPOINTS.SERVICE_BY_ID(id),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.serviceItem;
};

export const toggleServiceStatus = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  await api.patch(ADMIN_SERVICE_ENDPOINTS.TOGGLE_STATUS(id), { isActive });
};

export const deleteService = async (id: string): Promise<void> => {
  await api.delete(ADMIN_SERVICE_ENDPOINTS.SERVICE_BY_ID(id));
};
