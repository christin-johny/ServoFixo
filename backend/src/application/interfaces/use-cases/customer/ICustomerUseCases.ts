import { Customer } from "../../../../domain/entities/Customer";
import { PaginatedResult } from "../../../../domain/repositories/ICustomerRepository";
import { CustomerFilterDto, CustomerResponseDto } from "../../../dto/customer/AdminCustomerDtos";
import { ChangePasswordRequestDto, CustomerProfileResponse, IUploadAvatarFile, UpdateCustomerRequestDto } from "../../../dto/customer/CustomerAuthDto";
 


export interface IGetCustomerProfileUseCase { 
  execute(userId: string): Promise<CustomerProfileResponse>;
}

export interface IUpdateCustomerUseCase { 
  execute(customerId: string, updateDto: UpdateCustomerRequestDto): Promise<Customer>;
}

export interface IDeleteCustomerUseCase { 
  execute(customerId: string): Promise<void>;
}

export interface IChangePasswordUseCase { 
  execute(userId: string, data: ChangePasswordRequestDto): Promise<void>;
}

export interface IUploadAvatarUseCase { 
  execute(userId: string, file: IUploadAvatarFile): Promise<string>;
}

export interface IGetAllCustomersUseCase { 
  execute(filterDto: CustomerFilterDto): Promise<PaginatedResult<CustomerResponseDto>>;
}

export interface IGetCustomerByIdUseCase { 
  execute(customerId: string): Promise<Customer>;
}