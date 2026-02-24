import { ICustomerRepository, PaginatedResult } from '../../../domain/repositories/ICustomerRepository';
import { Customer } from '../../../domain/entities/Customer';
import { CustomerFilterDto, CustomerResponseDto } from '../../dto/customer/AdminCustomerDtos';
import { IGetAllCustomersUseCase } from '../../interfaces/use-cases/customer/ICustomerUseCases';
import { mapToResponseDto } from '../../mappers/CustomerMapper';


export class GetAllCustomersUseCase implements IGetAllCustomersUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository 
  ) {}

  async execute(filterDto: CustomerFilterDto): Promise<PaginatedResult<CustomerResponseDto>> {

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