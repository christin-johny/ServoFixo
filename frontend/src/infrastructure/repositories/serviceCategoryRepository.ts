import api from "../api/axiosClient";
import type { ServiceCategory } from "../../domain/types/ServiceCategory";

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

// 1. Get All Categories (with Search & Pagination)
export const getCategories = async (params: CategoryQueryParams): Promise<PaginatedCategories> => {
  const response = await api.get("/api/admin/categories", { params });
  return response.data;
};

// 2. Create Category (Uses FormData for Image Upload)
export const createCategory = async (formData: FormData): Promise<ServiceCategory> => {
  const response = await api.post("/api/admin/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.category;
};

// 3. Update Category (Uses FormData for Image Upload)
export const updateCategory = async (id: string, formData: FormData): Promise<ServiceCategory> => {
  const response = await api.put(`/api/admin/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.category;
};

// 4. Delete Category
export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/categories/${id}`);
};