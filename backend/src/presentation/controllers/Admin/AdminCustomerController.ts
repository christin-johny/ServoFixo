import { Request, Response } from "express";
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

export class AdminCustomerController {
  constructor(
    private readonly _getAllCustomersUseCase: IUseCase<unknown,[CustomerFilterDto]>, 
    private readonly _updateCustomerUseCase: IUseCase<unknown,[string, CustomerUpdateDto]>, 
    private readonly _getCustomerByIdUseCase: IUseCase<unknown, [string]>, 
    private readonly _deleteCustomerUseCase: IUseCase<void, [string]>, 
    private readonly _getAddressesByUserIdUseCase: IUseCase<unknown[],[string]>,
    private readonly _logger: ILogger
  ) {}

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = CustomerFilterSchema.safeParse(req.query);

      if (!validationResult.success) {
        this._logger.warn(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_FAILED, {
          reason: "Invalid Query",
          errors: validationResult.error.errors,
        });
        res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_QUERY,
          errors: validationResult.error.errors,
        });
        return;
      }

      const filterDto = validationResult.data;

      this._logger.info(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_INIT, {
        filters: filterDto,
      });

      const result = await this._getAllCustomersUseCase.execute(filterDto);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      this._logger.error(LogEvents.ADMIN_CUSTOMER_FETCH_ALL_FAILED, undefined, {
        error,
      });
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
        this._logger.warn(LogEvents.ADMIN_CUSTOMER_UPDATE_FAILED, {
          customerId,
          reason: "Validation Error",
        });
        res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.INVALID_DATA,
          errors: validationResult.error.errors,
        });
        return;
      }

      const updateDto = validationResult.data;

      this._logger.info(LogEvents.ADMIN_CUSTOMER_UPDATE_INIT, {
        customerId,
        fields: Object.keys(updateDto),
      });

      const updatedCustomer = await this._updateCustomerUseCase.execute(
        customerId,
        updateDto
      );

      res.status(StatusCodes.OK).json(mapToResponseDto(updatedCustomer as any));
    } catch (error) {
      this._logger.error(LogEvents.ADMIN_CUSTOMER_UPDATE_FAILED, undefined, {
        error,
        customerId,
      });

      if (error instanceof Error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: error.message });
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
      this._logger.info(LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_INIT, {
        customerId,
      });

      const customer = await this._getCustomerByIdUseCase.execute(customerId);

      res.status(StatusCodes.OK).json(mapToResponseDto(customer as any));
    } catch (error) {
      this._logger.error(
        LogEvents.ADMIN_CUSTOMER_FETCH_BY_ID_FAILED,
        undefined,
        { error, customerId }
      );

      if (error instanceof Error) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: error.message });
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
      this._logger.error(LogEvents.ADMIN_CUSTOMER_DELETE_FAILED, undefined, {
        error,
        customerId,
      });
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.INTERNAL_ERROR });
    }
  }

  async getCustomerAddresses(req: Request, res: Response): Promise<void> {
    const customerId = req.params.id;
    try {
      this._logger.info(LogEvents.ADMIN_CUSTOMER_ADDRESS_FETCH_INIT, {
        customerId,
      });

      const addresses = await this._getAddressesByUserIdUseCase.execute(
        customerId
      );
      res.status(StatusCodes.OK).json({ success: true, data: addresses });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this._logger.error(
        LogEvents.ADMIN_CUSTOMER_ADDRESS_FETCH_FAILED,
        errorMessage,
        { customerId }
      );

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: errorMessage || ErrorMessages.INTERNAL_ERROR,
      });
    }
  }
}
