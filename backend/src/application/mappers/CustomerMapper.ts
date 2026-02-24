import { Customer } from "../../domain/entities/Customer";
import { CustomerResponseDto } from "../dto/customer/AdminCustomerDtos";

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