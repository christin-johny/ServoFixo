import api from "../../api/axiosClient";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../domain/types/ServiceItem";


export const getCategories = async (): Promise<ServiceCategory[]> => {
  const response = await api.get("/api/customer/categories?isActive=true"); 
  return response.data.data;
};

export const getPopularServices = async (): Promise<ServiceItem[]> => {
  const response = await api.get("/api/customer/services/popular?limit=5");
  return response.data.data;
};


export const getServicesByCategory = async (categoryId: string): Promise<ServiceItem[]> => {
  const response = await api.get(`/api/customer/services?categoryId=${categoryId}&isActive=true`);
  return response.data.data;
};