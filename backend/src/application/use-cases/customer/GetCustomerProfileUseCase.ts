import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class GetCustomerProfileUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly addressRepository: IAddressRepository
  ) {}

  async execute(userId: string) {
    // 1. Fetch User
    const customer = await this.customerRepository.findById(userId);
    if (!customer) throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);

    // 2. Fetch Addresses
    const addresses = await this.addressRepository.findAllByUserId(userId);

    // 3. Combine them into a "Profile View"
    return {
      user: {
        id: customer.getId(),
        name: customer.getName(),
        email: customer.getEmail(),
        phone: customer.getPhone(),
        avatar: customer.getAvatarUrl(),
        // Add other non-sensitive customer fields here
      },
      addresses: addresses || [], // Safe fallback if null
      // Future: bookings: [] 
    };
  }
}