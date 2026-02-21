import { Customer } from "../../../domain/entities/Customer";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { StatusCodes } from "../../../presentation/utils/StatusCodes";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";

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