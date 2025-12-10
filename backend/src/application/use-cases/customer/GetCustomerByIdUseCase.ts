// backend/src/application/use-cases/customer/GetCustomerByIdUseCase.ts

import { Customer } from '../../../domain/entities/Customer';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { CustomerUpdateError } from './UpdateCustomerUseCase'; // Reuse the error class for consistency
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes'; 

/**
 * Use Case for retrieving a single Customer by ID for the Admin panel.
 */
export class GetCustomerByIdUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  /**
   * Executes the use case logic.
   * @param customerId The ID of the customer to retrieve.
   * @returns A promise resolving to the Customer Entity.
   */
  async execute(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);
    
    if (!customer) {
        throw new CustomerUpdateError('Customer not found.', StatusCodes.NOT_FOUND);
    }
    
    return customer;
  }
}