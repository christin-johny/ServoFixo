 
export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  suspended: boolean;  
  createdAt: string;
  updatedAt: string;
}
 
export interface PaginatedCustomersResult {
  data: CustomerDto[];
  total: number;
  page: number;
  limit: number;
}
 
export interface CustomerUpdatePayload {
  name: string;
  email: string;
  phone?: string;
  suspended: boolean;
}

export type CustomerStatusFilter = 'all' | 'active' | 'suspended';