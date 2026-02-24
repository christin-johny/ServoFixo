import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/services/IUseCase";  
import {
  CustomerFilterSchema,
  CustomerUpdateSchema,
} from "../../../application/dto/customer/AdminCustomerDtos";
import { StatusCodes } from "../../utils/StatusCodes";
import { ErrorMessages } from "../../../application/constants/ErrorMessages"; 
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { Customer } from "../../../domain/entities/Customer";
import { mapToResponseDto } from "../../../application/mappers/CustomerMapper";

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
    _logger: ILogger 
  ) {
    super(_logger);
  }

  getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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

      const result = await this._getAllCustomersUseCase.execute(validationResult.data);

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADMIN_CUSTOMER_FETCH_ALL_FAILED;
      next(error);
    }
  }

  updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const customerId = req.params.id;
    try {
      const validationResult = CustomerUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_DATA,
          errors: validationResult.error.errors,
        });
      }

      const updatedCustomer = await this._updateCustomerUseCase.execute(customerId, validationResult.data);

      return res.status(StatusCodes.OK).json(mapToResponseDto(updatedCustomer as Customer));
    } catch (error) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADMIN_CUSTOMER_UPDATE_FAILED;
      next(error);
    }
  }

  getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const customerId = req.params.id;
    try {

      const customer = await this._getCustomerByIdUseCase.execute(customerId);

      return res.status(StatusCodes.OK).json(mapToResponseDto(customer as Customer));
    } catch (error) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_FAILED;
      next(error);
    }
  }

  deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const customerId = req.params.id;
    try {
      await this._deleteCustomerUseCase.execute(customerId);
      
      return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADMIN_CUSTOMER_DELETE_FAILED;
      next(error);
    }
  }

  getCustomerAddresses = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const customerId = req.params.id;
    try {

      const addresses = await this._getAddressesByUserIdUseCase.execute(customerId);

      return this.ok(res, addresses); 
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADMIN_CUSTOMER_ADDRESS_FETCH_FAILED;
      next(error);
    }
  }
}