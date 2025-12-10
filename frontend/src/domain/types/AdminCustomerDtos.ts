// src/shared/types/dto/customer/AdminCustomerDtos.ts (FRONTEND)

// Matches the backend CustomerResponseDto
export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  suspended: boolean; // true means inactive/suspended, false means active
  createdAt: string;
  updatedAt: string;
}

// Matches the PaginatedResult<CustomerResponseDto> from the backend
export interface PaginatedCustomersResult {
  data: CustomerDto[];
  total: number;
  page: number;
  limit: number;
}

// Matches the backend CustomerUpdateDto
export interface CustomerUpdatePayload {
  name: string;
  email: string;
  phone?: string;
  suspended: boolean;
}

export type CustomerStatusFilter = 'all' | 'active' | 'suspended';