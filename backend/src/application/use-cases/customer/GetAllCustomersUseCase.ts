import { ICustomerRepository, PaginatedResult } from '../../../domain/repositories/ICustomerRepository';
import { Customer } from '../../../domain/entities/Customer';
import { CustomerFilterDto, CustomerResponseDto } from '../../dto/customer/AdminCustomerDtos';
import { ILogger } from '../../interfaces/ILogger';
import { LogEvents } from '../../../../../shared/constants/LogEvents';

export const mapToResponseDto = (customer: Customer): CustomerResponseDto => {
  return {
    id: customer.getId(),
    name: customer.getName(),
    email: customer.getEmail(),
    phone: customer.getPhone(),
    suspended: customer.isSuspended(), 
    createdAt: customer.getCreatedAt(),
    updatedAt: new Date(), 
  };
};

export class GetAllCustomersUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(filterDto: CustomerFilterDto): Promise<PaginatedResult<CustomerResponseDto>> {
    this._logger.info(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_INIT, { filters: filterDto });

    const page = filterDto.page;
    const limit = filterDto.limit;
    
    const filters = {
      search: filterDto.search,
      suspended: filterDto.suspended, 
    };

    const paginatedResult: PaginatedResult<Customer> = await this._customerRepository.findAllPaginated(
      page,
      limit,
      filters
    );
    const customerDtos: CustomerResponseDto[] = paginatedResult.data.map(mapToResponseDto);

    return {
      data: customerDtos,
      total: paginatedResult.total,
      page: paginatedResult.page,
      limit: paginatedResult.limit,
    };
  }
}