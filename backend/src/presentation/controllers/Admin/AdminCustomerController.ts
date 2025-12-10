import { Request, Response } from "express";
import { CustomerFilterSchema, CustomerUpdateSchema } from "../../../application/dto/Customer/AdminCustomerDtos";
import { GetAllCustomersUseCase } from "../../../application/use-cases/customer/GetAllCustomersUseCase";
import { UpdateCustomerUseCase, CustomerUpdateError } from '../../../application/use-cases/customer/UpdateCustomerUseCase'; 
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { mapToResponseDto } from '../../../application/use-cases/customer/GetAllCustomersUseCase';

export class AdminCustomerController {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase
  ) {}

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = CustomerFilterSchema.safeParse(req.query);

      if (!validationResult.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_QUERY,
          errors: validationResult.error.errors,
        });
        return;
      }

      const filterDto = validationResult.data;
      const result = await this.getAllCustomersUseCase.execute(filterDto);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.INTERNAL_ERROR,
      });
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.id;
    
    try {
      // 1. Input Validation (Body)
      const validationResult = CustomerUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          message: ErrorMessages.INVALID_DATA, 
          errors: validationResult.error.errors 
        });
        return;
      }
      
      const updateDto = validationResult.data;

      // 2. Execute the Update Use Case
      const updatedCustomer = await this.updateCustomerUseCase.execute(
        customerId,
        updateDto
      );

      // 3. Send the updated entity as a clean DTO response
      res.status(StatusCodes.OK).json(mapToResponseDto(updatedCustomer));

    } catch (error) {
      if (error instanceof CustomerUpdateError) {
        // Handle domain-specific errors (Not Found, Conflict)
        res.status(error.status).json({ message: error.message });
        return;
      }
      
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: ErrorMessages.INTERNAL_ERROR 
      });
    }
  }
}
