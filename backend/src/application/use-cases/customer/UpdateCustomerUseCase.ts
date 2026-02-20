import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Customer } from "../../../domain/entities/Customer";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class UpdateCustomerUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(customerId: string, updateDto: any): Promise<Customer> {
    const existing = await this._customerRepository.findById(customerId);
    if (!existing) {
        this._logger.warn(LogEvents.PROFILE_UPDATE_FAILED, { customerId, reason: "Customer Not Found" });
        throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    const nameToUpdate = updateDto.name ?? existing.getName();
    const phoneToUpdate = updateDto.phone ?? existing.getPhone();
    
    const suspendedToUpdate = updateDto.suspended !== undefined 
      ? updateDto.suspended 
      : existing.isSuspended();

    const emailToUpdate = existing.getEmail();

    if (updateDto.phone && updateDto.phone !== existing.getPhone()) {
      const customerByPhone = await this._customerRepository.findByPhone(updateDto.phone);
      if (customerByPhone && customerByPhone.getId() !== customerId) {
        this._logger.warn(LogEvents.PROFILE_UPDATE_FAILED, { customerId, reason: "Phone Already Exists" });
        throw new Error(ErrorMessages.PHONE_ALREADY_EXISTS);
      }
    }

    const updatedCustomer = new Customer(
      existing.getId(),
      nameToUpdate,
      emailToUpdate,
      existing.getPassword(),
      phoneToUpdate,
      existing.getAvatarUrl(),
      existing.getDefaultZoneId(),
      suspendedToUpdate, 
      existing.getAdditionalInfo(),
      existing.getGoogleId(),
      existing.getCreatedAt(),
      new Date(),
      existing.getIsDeleted()
    );

    const result = await this._customerRepository.update(updatedCustomer);
    return result;
  }
}