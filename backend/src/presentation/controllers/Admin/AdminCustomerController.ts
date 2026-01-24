import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";  
import {
  CustomerFilterSchema,
  CustomerUpdateSchema,
} from "../../../application/dto/customer/AdminCustomerDtos";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { mapToResponseDto } from "../../../application/use-cases/customer/GetAllCustomersUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

interface CustomerFilterDto {
  search?: string;
  suspended?: boolean;
}

interface CustomerUpdateDto {
  [key: string]: unknown;
}

export class AdminCustomerController extends BaseController {
  constructor(
    private readonly _getAllCustomersUseCase: IUseCase<unknown,[CustomerFilterDto]>, 
    private readonly _updateCustomerUseCase: IUseCase<unknown,[string, CustomerUpdateDto]>, 
    private readonly _getCustomerByIdUseCase: IUseCase<unknown, [string]>, 
    private readonly _deleteCustomerUseCase: IUseCase<void, [string]>, 
    private readonly _getAddressesByUserIdUseCase: IUseCase<unknown[],[string]>,
    _logger: ILogger // Passed to BaseController
  ) {
    super(_logger);
  }

  getAllCustomers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const validationResult = CustomerFilterSchema.safeParse(req.query);

      if (!validationResult.success) {
        this._logger.warn(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_FAILED, {
          reason: "Invalid Query",
          errors: validationResult.error.errors,
        });
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_QUERY,
          errors: validationResult.error.errors,
        });
      }

      this._logger.info(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_INIT, { filters: validationResult.data });

      const result = await this._getAllCustomersUseCase.execute(validationResult.data);

      // ✅ Aligned with getCustomers: returns response.data directly
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      return this.handleError(res, error, LogEvents.ADMIN_CUSTOMER_FETCH_ALL_FAILED);
    }
  }

  updateCustomer = async (req: Request, res: Response): Promise<Response> => {
    const customerId = req.params.id;
    try {
      const validationResult = CustomerUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_DATA,
          errors: validationResult.error.errors,
        });
      }

      this._logger.info(LogEvents.ADMIN_CUSTOMER_UPDATE_INIT, { customerId });

      const updatedCustomer = await this._updateCustomerUseCase.execute(customerId, validationResult.data);

      // ✅ Aligned with updateCustomer: returns response.data (the customer object)
      return res.status(StatusCodes.OK).json(mapToResponseDto(updatedCustomer as any));
    } catch (error) {
      return this.handleError(res, error, LogEvents.ADMIN_CUSTOMER_UPDATE_FAILED);
    }
  }

  getCustomerById = async (req: Request, res: Response): Promise<Response> => {
    const customerId = req.params.id;
    try {
      this._logger.info(LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_INIT, { customerId });

      const customer = await this._getCustomerByIdUseCase.execute(customerId);

      // ✅ Aligned with getCustomerById: returns response.data directly
      return res.status(StatusCodes.OK).json(mapToResponseDto(customer as any));
    } catch (error) {
      return this.handleError(res, error, LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_FAILED);
    }
  }

  deleteCustomer = async (req: Request, res: Response): Promise<Response> => {
    const customerId = req.params.id;
    try {
      this._logger.info(LogEvents.ADMIN_CUSTOMER_DELETE_INIT, { customerId });
      await this._deleteCustomerUseCase.execute(customerId);
      
      return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      return this.handleError(res, error, LogEvents.ADMIN_CUSTOMER_DELETE_FAILED);
    }
  }

  getCustomerAddresses = async (req: Request, res: Response): Promise<Response> => {
    const customerId = req.params.id;
    try {
      this._logger.info(LogEvents.ADMIN_CUSTOMER_ADDRESS_FETCH_INIT, { customerId });

      const addresses = await this._getAddressesByUserIdUseCase.execute(customerId);

      // ✅ Aligned with getCustomerAddresses: repository expects response.data.data
      return this.ok(res, addresses); 
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.ADMIN_CUSTOMER_ADDRESS_FETCH_FAILED);
    }
  }
}