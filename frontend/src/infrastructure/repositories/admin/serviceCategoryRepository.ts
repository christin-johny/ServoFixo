import api from "../../api/axiosClient";
import { ADMIN_CATEGORY_ENDPOINTS } from "../../api/endpoints/Admin/admin.endpoints";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";

export interface CategoryQueryParams {
  page: number;
  limit: number;
  search: string;
  isActive?: string;
}

export interface PaginatedCategories {
  categories: ServiceCategory[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const getCategories = async (
  params: CategoryQueryParams
): Promise<PaginatedCategories> => {
  const response = await api.get(ADMIN_CATEGORY_ENDPOINTS.CATEGORIES, {
    params,
  });
  return response.data;
};

export const createCategory = async (
  formData: FormData
): Promise<ServiceCategory> => {
  const response = await api.post(
    ADMIN_CATEGORY_ENDPOINTS.CATEGORIES,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.data;
};

export const updateCategory = async (
  id: string,
  formData: FormData
): Promise<ServiceCategory> => {
  const response = await api.put(
    ADMIN_CATEGORY_ENDPOINTS.CATEGORY_BY_ID(id),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.data;
};

export const toggleCategoryStatus = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  await api.patch(ADMIN_CATEGORY_ENDPOINTS.TOGGLE_STATUS(id), { isActive });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(ADMIN_CATEGORY_ENDPOINTS.CATEGORY_BY_ID(id));
};
