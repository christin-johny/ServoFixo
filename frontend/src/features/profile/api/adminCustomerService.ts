import api from "../../../lib/axiosClient";
import { ADMIN_CUSTOMER_ENDPOINTS } from "./endpoints";

import type {
  CustomerDto,
  CustomerUpdatePayload,
} from "../types/AdminCustomerDtos";
import type { PaginatedAdminBookingResult } from "../../booking/api/adminBookingRepository";

export interface CustomerQueryParams {
  page: number;
  limit: number;
  search?: string;
  suspended?: string;
}

export interface PaginatedCustomersResult {
  data: CustomerDto[];
  total: number;
  page: number;
  limit: number;
}

export const getCustomers = async (
  params: CustomerQueryParams
): Promise<PaginatedCustomersResult> => {
  const response = await api.get(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMERS, { params });
  return response.data;
};

export const updateCustomer = async (
  id: string,
  payload: CustomerUpdatePayload
): Promise<CustomerDto> => {
  const response = await api.put(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_BY_ID(id), payload);
  return response.data;
};

export const getCustomerById = async (id: string): Promise<CustomerDto> => {
  const response = await api.get(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_BY_ID(id));
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_BY_ID(id));
};

export const getCustomerAddresses = async (id: string): Promise<unknown[]> => {
  const response = await api.get(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_ADDRESSES(id));
  return response.data.data;
};

export const getCustomerOrdersAdmin = async (
  customerId: string,
  page = 1
): Promise<PaginatedAdminBookingResult> => {
  const response = await api.get(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_ORDERS, {
    params: { customerId, page, limit: 5 },
  });
  return response.data.data;
};