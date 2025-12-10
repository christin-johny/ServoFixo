// src/infrastructure/api/CustomerService.ts

// ✅ 1. Use your existing global API client
import api from "../../api/axiosClient"; 

// Import types from the frontend DTOs
import type { CustomerDto, CustomerUpdatePayload } from '../../../domain/types/AdminCustomerDtos';

// Define the exact query structure the frontend sends (maps to backend DTO)
export interface CustomerQueryParams {
    page: number;
    limit: number;
    search?: string;
    // Note: The 'suspended' value must be 'true', 'false', or undefined (matches backend DTO structure)
    suspended?: string; 
}

// Define the exact paginated response structure
export interface PaginatedCustomersResult {
    data: CustomerDto[];
    total: number;
    page: number;
    limit: number;
}

/**
 * 1. Fetches a paginated and filtered list of customers for the Admin panel.
 * ✅ Adheres to CategoryService pattern by using { params }.
 */
export const getCustomers = async (params: CustomerQueryParams): Promise<PaginatedCustomersResult> => {
    try {
        // Axios handles query string construction and auth header globally
        const response = await api.get("/api/admin/customers", { params });
        
        // Assuming the backend response structure is { data: [CustomerDto], total: number, page: number, limit: number }
        return response.data; 

    } catch (error) {
        // Use generic error handling consistent with the CategoryService file's environment
        console.error("CustomerService: Error fetching customer list:", error);
        throw error;
    }
};

/**
 * 2. Updates the customer profile details and status (used by the Edit Modal).
 * ✅ Authentication and headers handled by the global API client.
 */
export const updateCustomer = async (id: string, payload: CustomerUpdatePayload): Promise<CustomerDto> => {
    try {
        // The payload is passed directly as the request body
        const response = await api.put(`/api/admin/customers/${id}`, payload);
        
        // Assuming the backend returns the updated Customer DTO directly
        return response.data; 
        
    } catch (error) {
        console.error(`CustomerService: Error updating customer ${id}:`, error);
        throw error;
    }
};

// ⚠️ We will not implement delete or create as they are currently de-prioritized.