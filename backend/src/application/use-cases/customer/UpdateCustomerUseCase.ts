// backend/src/application/use-cases/customer/UpdateCustomerUseCase.ts

import { Customer } from '../../../domain/entities/Customer';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { CustomerUpdateDto } from '../../dto/Customer/AdminCustomerDtos';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes'; // Assuming correct path

/** Custom Error Class for Consistency */
export class CustomerUpdateError extends Error {
    public status: StatusCodes;
    constructor(message: string, status: StatusCodes = StatusCodes.BAD_REQUEST) {
        super(message);
        this.name = 'CustomerUpdateError';
        this.status = status;
    }
}

/**
 * Use Case for Admin to update a customer's profile details and status.
 * Ensures data integrity (uniqueness) during updates.
 */
export class UpdateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) {}

    async execute(customerId: string, updateDto: CustomerUpdateDto): Promise<Customer> {
        // 1. Check if the Customer exists
        const existingCustomer = await this.customerRepository.findById(customerId);
        if (!existingCustomer) {
            throw new CustomerUpdateError('Customer not found.', StatusCodes.NOT_FOUND);
        }
        
        // 2. Uniqueness Check for Email
        if (updateDto.email !== existingCustomer.getEmail()) {
            const customerByEmail = await this.customerRepository.findByEmail(updateDto.email);
            if (customerByEmail && customerByEmail.getId() !== customerId) {
                throw new CustomerUpdateError('Email is already registered by another user.', StatusCodes.CONFLICT);
            }
        }

        // 3. Uniqueness Check for Phone (if provided)
        if (updateDto.phone && updateDto.phone !== existingCustomer.getPhone()) {
            const customerByPhone = await this.customerRepository.findByPhone(updateDto.phone);
            if (customerByPhone && customerByPhone.getId() !== customerId) {
                throw new CustomerUpdateError('Phone number is already registered by another user.', StatusCodes.CONFLICT);
            }
        }
        
        // --- 4. Prepare Updated Entity ---
        
        // To update the entity, we must create a NEW instance with the desired changes.
        // We reuse the existing entity's core data (password, avatar, etc.)
        // Note: The Email and Phone types need to be correct, assuming they are simple strings
        // for DTO parsing and rely on Domain types like Email and Phone (imported below).
        
        const updatedCustomer = new Customer(
            existingCustomer.getId(),
            updateDto.name,
            updateDto.email,
            existingCustomer.getPassword(), // Password remains unchanged
            updateDto.phone,
            existingCustomer.getAvatarUrl(),
            existingCustomer.getDefaultZoneId(),
            existingCustomer.getAddresses(),
            updateDto.suspended, // This is the status toggle
            existingCustomer.getSuspendReason(),
            existingCustomer.getAdditionalInfo(),
            existingCustomer.getGoogleId(),
            existingCustomer.getCreatedAt(),
            new Date() // Set updated timestamp
        );

        // 5. Update and Persist in Repository
        const savedCustomer = await this.customerRepository.update(updatedCustomer);
        
        return savedCustomer;
    }
}