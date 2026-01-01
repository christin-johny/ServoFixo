import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class GetCustomerProfileUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _addressRepository: IAddressRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(userId: string) {
    this._logger.info(LogEvents.PROFILE_FETCH_INIT, { userId });

    const customer = await this._customerRepository.findById(userId);
    if (!customer) {
        this._logger.warn(LogEvents.PROFILE_FETCH_FAILED, { userId, reason: "Not Found" });
        throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    const addresses = await this._addressRepository.findAllByUserId(userId);

    return {
      user: {
        id: customer.getId(),
        name: customer.getName(),
        email: customer.getEmail(),
        phone: customer.getPhone(),
        avatarUrl: customer.getAvatarUrl(),
      }
    };
  }
}