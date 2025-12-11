import api from "../../api/axiosClient";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../domain/types/ServiceItem";

// 1. Fetch Top Categories (for the top strip)
export const getCategories = async (): Promise<ServiceCategory[]> => {
  // We can reuse the admin endpoint for now, or create a specific customer one later
  const response = await api.get("/api/customer/categories?isActive=true"); 
  return response.data.data;
};

// 2. Fetch Most Booked (for the first section)
export const getPopularServices = async (): Promise<ServiceItem[]> => {
  const response = await api.get("/api/customer/services/popular?limit=5");
  return response.data.data;
};

// 3. Fetch Services by Category (for "Appliances" & "Salon" sections)
export const getServicesByCategory = async (categoryId: string): Promise<ServiceItem[]> => {
  const response = await api.get(`/api/customer/services?categoryId=${categoryId}&isActive=true`);
  return response.data.data;
};