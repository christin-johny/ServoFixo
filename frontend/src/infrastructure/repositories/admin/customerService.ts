import api from "../../api/axiosClient";
import { ADMIN_CUSTOMER_ENDPOINTS } from "../../api/endpoints/Admin/admin.endpoints";

import type {
  CustomerDto,
  CustomerUpdatePayload,
} from "../../../domain/types/AdminCustomerDtos";

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
  try {
    const response = await api.get(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMERS, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("AdminCustomerService: Error fetching customer list:", error);
    throw error;
  }
};

export const updateCustomer = async (
  id: string,
  payload: CustomerUpdatePayload
): Promise<CustomerDto> => {
  try {
    const response = await api.put(
      ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_BY_ID(id),
      payload
    );

    return response.data;
  } catch (error) {
    console.error(
      `AdminCustomerService: Error updating customer ${id}:`,
      error
    );
    throw error;
  }
};

export const getCustomerById = async (id: string): Promise<CustomerDto> => {
  try {
    const response = await api.get(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(
      `AdminCustomerService: Error fetching customer ${id}:`,
      error
    );
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await api.delete(ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_BY_ID(id));
  } catch (error) {
    console.error(
      `AdminCustomerService: Error deleting customer ${id}:`,
      error
    );
    throw error;
  }
};

export const getCustomerAddresses = async (id: string): Promise<unknown[]> => {
  try {
    const response = await api.get(
      ADMIN_CUSTOMER_ENDPOINTS.CUSTOMER_ADDRESSES(id)
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `AdminCustomerService: Error fetching addresses for customer ${id}:`,
      error
    );
    throw error;
  }
};
