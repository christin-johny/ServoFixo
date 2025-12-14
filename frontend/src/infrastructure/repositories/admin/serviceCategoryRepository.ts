import api from "../../api/axiosClient";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";

export interface CategoryQueryParams {
  page: number;
  limit: number;
  search: string;
  isActive?: string;
}

export interface PaginatedCategories {
  data: ServiceCategory[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const getCategories = async (
  params: CategoryQueryParams
): Promise<PaginatedCategories> => {
  const response = await api.get("/admin/categories", { params });
  return response.data;
};

export const createCategory = async (
  formData: FormData
): Promise<ServiceCategory> => {
  const response = await api.post("/admin/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.category;
};

export const updateCategory = async (
  id: string,
  formData: FormData
): Promise<ServiceCategory> => {
  const response = await api.put(`/admin/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.category;
};

export const toggleCategoryStatus = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  await api.patch(`/admin/categories/${id}/toggle`, { isActive });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};
