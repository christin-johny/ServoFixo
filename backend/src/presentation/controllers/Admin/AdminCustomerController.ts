import { Request, Response } from "express";
import {
  CustomerFilterSchema,
  CustomerUpdateSchema,
} from "../../../application/dto/Customer/AdminCustomerDtos";
import { GetAllCustomersUseCase } from "../../../application/use-cases/customer/GetAllCustomersUseCase";
import {UpdateCustomerUseCase} from "../../../application/use-cases/customer/UpdateCustomerUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { mapToResponseDto } from "../../../application/use-cases/customer/GetAllCustomersUseCase";
import { GetCustomerByIdUseCase } from "../../../application/use-cases/customer/GetCustomerByIdUseCase";
import { DeleteCustomerUseCase } from "../../../application/use-cases/customer/DeleteCustomerUseCase";
import { GetAddressesUseCase } from "../../../application/use-cases/address/GetAddressesUseCase";
export class AdminCustomerController {
  constructor(
    private readonly getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly getAddressesByUserIdUseCase: GetAddressesUseCase
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
      const validationResult = CustomerUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_DATA,
          errors: validationResult.error.errors,
        });
        return;
      }

      const updateDto = validationResult.data;

      const updatedCustomer = await this.updateCustomerUseCase.execute(
        customerId,
        updateDto
      );

      res.status(StatusCodes.OK).json(mapToResponseDto(updatedCustomer));
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.INTERNAL_ERROR,
      });
    }
  }
  async getCustomerById(req: Request, res: Response): Promise<void> {
    const customerId = req.params.id;

    try {
      const customer = await this.getCustomerByIdUseCase.execute(customerId);

      res.status(StatusCodes.OK).json(mapToResponseDto(customer));
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.INTERNAL_ERROR,
      });
    }
  }
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteCustomerUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.INTERNAL_ERROR});
    }
  }
  async getCustomerAddresses(req: Request, res: Response): Promise<void> {
    const customerId = req.params.id; 
    try {
      const addresses = await this.getAddressesByUserIdUseCase.execute(customerId);
      res.status(StatusCodes.OK).json({ success: true, data: addresses });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: error.message || ErrorMessages.INTERNAL_ERROR 
      });
    }
  }
}
