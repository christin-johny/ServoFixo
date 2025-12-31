import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class GetCustomerProfileUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _addressRepository: IAddressRepository
  ) {}

  async execute(userId: string) {

    const customer = await this._customerRepository.findById(userId);
    if (!customer) throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);

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