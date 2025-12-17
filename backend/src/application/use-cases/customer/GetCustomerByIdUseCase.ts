import { Customer } from "../../../domain/entities/Customer";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { CustomerUpdateError } from "./UpdateCustomerUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class GetCustomerByIdUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomerUpdateError(
        ErrorMessages.CUSTOMER_NOT_FOUND,
        StatusCodes.NOT_FOUND
      );
    }

    return customer;
  }
}
