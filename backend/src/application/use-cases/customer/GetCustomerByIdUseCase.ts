import { Customer } from "../../../domain/entities/Customer";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { CustomerUpdateError } from "./UpdateCustomerUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

export class GetCustomerByIdUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new CustomerUpdateError(
        "Customer not found.",
        StatusCodes.NOT_FOUND
      );
    }

    return customer;
  }
}
