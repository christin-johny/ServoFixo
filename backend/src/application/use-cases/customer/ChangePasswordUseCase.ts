import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IPasswordHasher } from "../../interfaces/IPasswordHasher";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { Customer } from "../../../domain/entities/Customer";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";

export class ChangePasswordUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _logger: ILogger
  ) {}

  async execute(userId: string, data: any): Promise<void> {
    

    const { currentPassword, newPassword } = data;
    const customer = await this._customerRepository.findById(userId);
    if (!customer) {
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    const storedPassword = customer.getPassword();
    if (!storedPassword) {
      this._logger.warn(LogEvents.PASSWORD_CHANGE_FAILED, { userId, reason: "Google Account" });
      throw new Error(ErrorMessages.GOOGLE_REGISTERED);
    }

    const isMatch = await this._passwordHasher.compare(
      currentPassword,
      storedPassword
    );
    if (!isMatch) {
      this._logger.warn(LogEvents.PASSWORD_CHANGE_FAILED, { userId, reason: "Invalid Password" });
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