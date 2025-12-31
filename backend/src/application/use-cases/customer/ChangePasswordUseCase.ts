import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IPasswordHasher } from "../../services/IPasswordHasher";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Customer } from "../../../domain/entities/Customer";

export class ChangePasswordUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute(userId: string, data: any): Promise<void> {
    const { currentPassword, newPassword } = data;
    const customer = await this._customerRepository.findById(userId);
    if (!customer) {
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    const storedPassword = customer.getPassword();
    if (!storedPassword) {
      throw new Error(ErrorMessages.GOOGLE_REGISTERED);
    }

    const isMatch = await this._passwordHasher.compare(
      currentPassword,
      storedPassword
    );
    if (!isMatch) {
      throw new Error(ErrorMessages.INVALID_PASSWORD);
    }

    const newHashedPassword = await this._passwordHasher.hash(newPassword);

    const updatedCustomer = new Customer(
      customer.getId(),
      customer.getName(),
      customer.getEmail(),
      newHashedPassword,
      customer.getPhone(),
      customer.getAvatarUrl(),
      customer.getDefaultZoneId(),
      customer.isSuspended(),
      customer.getAdditionalInfo(),
      customer.getGoogleId(),
      customer.getCreatedAt(),
      new Date(),
      customer.getIsDeleted()
    );

    await this._customerRepository.update(updatedCustomer);
  }
}
