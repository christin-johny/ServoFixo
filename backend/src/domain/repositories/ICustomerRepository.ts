
import { Customer } from '../entities/Customer';


export interface ICustomerRepository {

  findById(id: string): Promise<Customer | null>;

  findByEmail(email: string): Promise<Customer | null>;

  create(customer: Customer): Promise<Customer>;

  update(customer: Customer): Promise<Customer>;
}
