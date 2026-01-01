import { Customer } from "../entities/Customer";
import { IBaseRepository } from "./IBaseRepository";

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

export interface ICustomerRepository extends IBaseRepository<Customer> {
  // findById(id: string): Promise<Customer | null>;
  // create(customer: Customer): Promise<Customer>;
  // update(customer: Customer): Promise<Customer>;
  // delete(id: string): Promise<boolean>;


  findByEmail(email: string): Promise<Customer | null>;

  findByPhone(phone: string): Promise<Customer | null>;

  findAllPaginated(
    page: number,
    limit: number,
    filters: CustomerFilterParams
  ): Promise<PaginatedResult<Customer>>;
}
