import { Customer } from "../../../domain/entities/Customer";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { CustomerUpdateDto } from "../../dto/Customer/AdminCustomerDtos";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

export class CustomerUpdateError extends Error {
  public status: StatusCodes;
  constructor(message: string, status: StatusCodes = StatusCodes.BAD_REQUEST) {
    super(message);
    this.name = "CustomerUpdateError";
    this.status = status;
  }
}

export class UpdateCustomerUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(
    customerId: string,
    updateDto: CustomerUpdateDto
  ): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(customerId);
    if (!existingCustomer) {
      throw new CustomerUpdateError(
        "Customer not found.",
        StatusCodes.NOT_FOUND
      );
    }

    if (updateDto.email !== existingCustomer.getEmail()) {
      const customerByEmail = await this.customerRepository.findByEmail(
        updateDto.email
      );
      if (customerByEmail && customerByEmail.getId() !== customerId) {
        throw new CustomerUpdateError(
          "Email is already registered by another user.",
          StatusCodes.CONFLICT
        );
      }
    }
    if (updateDto.phone && updateDto.phone !== existingCustomer.getPhone()) {
      const customerByPhone = await this.customerRepository.findByPhone(
        updateDto.phone
      );
      if (customerByPhone && customerByPhone.getId() !== customerId) {
        throw new CustomerUpdateError(
          "Phone number is already registered by another user.",
          StatusCodes.CONFLICT
        );
      }
    }

    const updatedCustomer = new Customer(
      existingCustomer.getId(),
      updateDto.name,
      updateDto.email,
      existingCustomer.getPassword(),
      updateDto.phone,
      existingCustomer.getAvatarUrl(),
      existingCustomer.getDefaultZoneId(),
      existingCustomer.getAddresses(),
      updateDto.suspended,
      existingCustomer.getSuspendReason(),
      existingCustomer.getAdditionalInfo(),
      existingCustomer.getGoogleId(),
      existingCustomer.getCreatedAt(),
      new Date()
    );

    const savedCustomer = await this.customerRepository.update(updatedCustomer);

    return savedCustomer;
  }
}
