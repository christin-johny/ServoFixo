import { ICustomerRepository, PaginatedResult } from '../../../domain/repositories/ICustomerRepository';
import { Customer } from '../../../domain/entities/Customer';
import { CustomerFilterDto, CustomerResponseDto } from '../../dto/Customer/AdminCustomerDtos';

/**
 * Transforms a Customer Entity into the safe, structured CustomerResponseDto.
 * @param customer The Customer Entity from the domain layer.
 * @returns A clean CustomerResponseDto.
 */
export const mapToResponseDto = (customer: Customer): CustomerResponseDto => {
  return {
    id: customer.getId(),
    name: customer.getName(),
    email: customer.getEmail(),
    phone: customer.getPhone(),
    // Mapping internal 'suspended' to the external view
    suspended: customer.isSuspended(), 
    createdAt: customer.getCreatedAt(),
    updatedAt: new Date(), // Using new Date() as a default fallback if updatedAt is missing/private
  };
};

/**
 * Use Case for retrieving a paginated and filtered list of Customers for the Admin panel.
 */
export class GetAllCustomersUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  /**
   * Executes the use case logic.
   * @param filterDto Validated filter parameters from the request query.
   * @returns A promise resolving to a paginated result of CustomerResponseDto.
   */
  async execute(filterDto: CustomerFilterDto): Promise<PaginatedResult<CustomerResponseDto>> {
    // 1. Extract and format parameters for the Repository
    const page = filterDto.page;
    const limit = filterDto.limit;
    
    // Convert 'suspended' filter back to a boolean for the repository query
    const filters = {
      search: filterDto.search,
      suspended: filterDto.suspended, // This is already a boolean/undefined thanks to DTO transform
    };

    // 2. Fetch data from the Repository using the new paginated method
    const paginatedResult: PaginatedResult<Customer> = await this.customerRepository.findAllPaginated(
      page,
      limit,
      filters
    );

    // 3. Map the retrieved entities to the secure Response DTO structure
    const customerDtos: CustomerResponseDto[] = paginatedResult.data.map(mapToResponseDto);

    // 4. Return the final paginated result
    return {
      data: customerDtos,
      total: paginatedResult.total,
      page: paginatedResult.page,
      limit: paginatedResult.limit,
    };
  }
}