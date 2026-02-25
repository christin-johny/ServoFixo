import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { S3UrlHelper } from "../../../infrastructure/storage/S3UrlHelper";

export class GetCustomerProfileUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(userId: string) {

    const customer = await this._customerRepository.findById(userId);
    if (!customer) {
        this._logger.warn(LogEvents.PROFILE_FETCH_FAILED, { userId, reason: "Not Found" });
        throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }
 

    return {
      user: {
        id: customer.getId(),
        name: customer.getName(),
        email: customer.getEmail(),
        phone: customer.getPhone(),
        avatarUrl: S3UrlHelper.getFullUrl(customer.getAvatarUrl()),
      }
    };
  }
}