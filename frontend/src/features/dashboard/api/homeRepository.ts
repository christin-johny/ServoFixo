import api from "../../../lib/axiosClient";
import { CUSTOMER_SERVICE_ENDPOINTS } from "./endpoints";
import type { ServiceCategory } from "../../service-catalog/types/ServiceCategory";
import type { ServiceItem } from "../../service-catalog/types/ServiceItem";

export const getCategories = async (): Promise<ServiceCategory[]> => {
  const response = await api.get(CUSTOMER_SERVICE_ENDPOINTS.CATEGORIES, {
    params: { isActive: true },
  });
  return response.data.data;
};

export const getPopularServices = async (): Promise<ServiceItem[]> => {
  const response = await api.get(CUSTOMER_SERVICE_ENDPOINTS.POPULAR_SERVICES, {
    params: { limit: 6 },
  });
  return response.data.data;
};

export const getServicesByCategory = async (
  categoryId: string
): Promise<ServiceItem[]> => {
  const response = await api.get(CUSTOMER_SERVICE_ENDPOINTS.SERVICES, {
    params: {
      categoryId,
      isActive: true,
    },
  });
  return response.data.data;
};
