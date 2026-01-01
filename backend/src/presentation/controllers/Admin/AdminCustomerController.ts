import { Request, Response } from "express";
import {
  CustomerFilterSchema,
  CustomerUpdateSchema,
} from "../../../application/dto/Customer/AdminCustomerDtos";
import { GetAllCustomersUseCase } from "../../../application/use-cases/customer/GetAllCustomersUseCase";
import { UpdateCustomerUseCase } from "../../../application/use-cases/customer/UpdateCustomerUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { mapToResponseDto } from "../../../application/use-cases/customer/GetAllCustomersUseCase";
import { GetCustomerByIdUseCase } from "../../../application/use-cases/customer/GetCustomerByIdUseCase";
import { DeleteCustomerUseCase } from "../../../application/use-cases/customer/DeleteCustomerUseCase";
import { GetAddressesUseCase } from "../../../application/use-cases/address/GetAddressesUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class AdminCustomerController {
  constructor(
    private readonly _getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly _updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly _getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly _deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly _getAddressesByUserIdUseCase: GetAddressesUseCase,
    private readonly _logger: ILogger
  ) {}

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = CustomerFilterSchema.safeParse(req.query);

      if (!validationResult.success) {
        this._logger.warn(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_FAILED, {
           reason: "Invalid Query",
           errors: validationResult.error.errors 
        });
        res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_QUERY,
          errors: validationResult.error.errors,
        });
        return;
      }

      const filterDto = validationResult.data;
      
      this._logger.info(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_INIT, { filters: filterDto });

      const result = await this._getAllCustomersUseCase.execute(filterDto);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      this._logger.error(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_FAILED, undefined, { error });
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
        this._logger.warn(LogEvents.ADMIN_CUSTOMER_UPDATE_FAILED, { customerId, reason: "Validation Error" });
        res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_DATA,
          errors: validationResult.error.errors,
        });
        return;
      }

      const updateDto = validationResult.data;

      // Log only keys to protect PII
      this._logger.info(LogEvents.ADMIN_CUSTOMER_UPDATE_INIT, { 
        customerId, 
        fields: Object.keys(updateDto) 
      });

      const updatedCustomer = await this._updateCustomerUseCase.execute(
        customerId,
        updateDto
      );

      res.status(StatusCodes.OK).json(mapToResponseDto(updatedCustomer));
    } catch (error) {
      this._logger.error(LogEvents.ADMIN_CUSTOMER_UPDATE_FAILED, undefined, { error, customerId });
      
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
      this._logger.info(LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_INIT, { customerId });

      const customer = await this._getCustomerByIdUseCase.execute(customerId);

      res.status(StatusCodes.OK).json(mapToResponseDto(customer));
    } catch (error) {
      this._logger.error(LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_FAILED, undefined, { error, customerId });

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
    const customerId = req.params.id;
    try {
      this._logger.info(LogEvents.ADMIN_CUSTOMER_DELETE_INIT, { customerId });

      await this._deleteCustomerUseCase.execute(customerId);
      res.status(204).send();
    } catch (error) {
      this._logger.error(LogEvents.ADMIN_CUSTOMER_DELETE_FAILED, undefined, { error, customerId });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.INTERNAL_ERROR});
    }
  }

  async getCustomerAddresses(req: Request, res: Response): Promise<void> {
    const customerId = req.params.id; 
    try {
      this._logger.info(LogEvents.ADMIN_CUSTOMER_ADDRESS_FETCH_INIT, { customerId });
      
      const addresses = await this._getAddressesByUserIdUseCase.execute(customerId);
      res.status(StatusCodes.OK).json({ success: true, data: addresses });
    } catch (error: any) {
      this._logger.error(LogEvents.ADMIN_CUSTOMER_ADDRESS_FETCH_FAILED, undefined, { error, customerId });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: error.message || ErrorMessages.INTERNAL_ERROR 
      });
    }
  }
}