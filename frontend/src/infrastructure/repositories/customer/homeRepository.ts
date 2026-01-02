import api from "../../api/axiosClient";
import { CUSTOMER_SERVICE_ENDPOINTS } from "../../api/endpoints/Customer/customer.endpoints";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../domain/types/ServiceItem";

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
