import { Customer } from "../../../domain/entities/Customer";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";

import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class GetCustomerByIdUseCase {
  constructor(private readonly _customerRepository: ICustomerRepository) {}

  async execute(customerId: string): Promise<Customer> {
    const customer = await this._customerRepository.findById(customerId);
    if (!customer) {
      throw new Error(
        ErrorMessages.CUSTOMER_NOT_FOUND
      );
    }

    return customer;
  }
}
