import { Customer } from "../../../domain/entities/Customer";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class GetCustomerByIdUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(customerId: string): Promise<Customer> {

    const customer = await this._customerRepository.findById(customerId);
    if (!customer) {
      this._logger.warn(LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_FAILED, { customerId, reason: "Not Found" });
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    return customer;
  }
}