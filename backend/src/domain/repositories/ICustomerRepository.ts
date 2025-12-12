import { Customer } from "../entities/Customer";

export interface CustomerFilterParams {
  search?: string; 
  suspended?: boolean; 
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ICustomerRepository {

  findById(id: string): Promise<Customer | null>;
  
  findByEmail(email: string): Promise<Customer | null>;

  findByPhone(phone: string): Promise<Customer | null>;

  create(customer: Customer): Promise<Customer>;

  update(customer: Customer): Promise<Customer>;

  findAllPaginated(
    page: number,
    limit: number,
    filters: CustomerFilterParams
  ): Promise<PaginatedResult<Customer>>;
  delete(id: string): Promise<boolean>;
}