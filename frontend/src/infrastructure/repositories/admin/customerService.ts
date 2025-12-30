import api from "../../api/axiosClient";

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
    const response = await api.get("/admin/customers", { params });

    return response.data;
  } catch (error) {
    console.error("CustomerService: Error fetching customer list:", error);
    throw error;
  }
};

export const updateCustomer = async (
  id: string,
  payload: CustomerUpdatePayload
): Promise<CustomerDto> => {
  try {
    const response = await api.put(`/admin/customers/${id}`, payload);

    return response.data;
  } catch (error) {
    console.error(`CustomerService: Error updating customer ${id}:`, error);
    throw error;
  }
};

export const getCustomerById = async (id: string): Promise<CustomerDto> => {
  try {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`CustomerService: Error fetching customer ${id}:`, error);
    throw error;
  }
};
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await api.delete(`/admin/customers/${id}`);
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }
};


export const getCustomerAddresses = async (id: string): Promise<unknown[]> => {
  try {
    const response = await api.get(`/admin/customers/${id}/addresses`);
    return response.data.data; 
  } catch (error) {
    console.error(`Error fetching addresses for customer ${id}:`, error);
    throw error;
  }
};
