import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import { CreateAddressDto } from "../../../application/dto/address/CreateAddressDto";
import { UpdateAddressDto } from "../../../application/dto/address/UpdateAddressDto"; 
import { AddressResponseDto } from "../../../application/dto/address/AddressResponseDto"; 
import { ILogger } from "../../../application/interfaces/ILogger"; 
import { LogEvents } from "../../../infrastructure/logging/LogEvents"; 
import { ErrorMessages, SuccessMessages } from "../../../application/constants/ErrorMessages"; 

export interface AuthenticatedRequest extends Request {
  userId?: string; 
}

export class CustomerAddressController extends BaseController {
  constructor( 
    private readonly _addAddressUseCase: IUseCase<AddressResponseDto, [CreateAddressDto, string]>, 
    private readonly _updateAddressUseCase: IUseCase<AddressResponseDto, [string, string, UpdateAddressDto]>, 
    private readonly _getAddressesUseCase: IUseCase<AddressResponseDto[], [string]>,  
    private readonly _deleteAddressUseCase: IUseCase<boolean, [string, string]>,
    _logger: ILogger 
  ) {
    super(_logger);
  }

  private getUserId(req: Request): string {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);
    return userId;
  }

  addAddress = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = this.getUserId(req);
      const dto = req.body as CreateAddressDto;

      const resultDto = await this._addAddressUseCase.execute(dto, userId); 
      // Use cast only for the dynamic property check to avoid broad 'any' usage
      const isServiceable = (resultDto as { isServiceable?: boolean }).isServiceable ?? true;

      const message = isServiceable ? SuccessMessages.ADDRESS_ADDED : SuccessMessages.ADDRESS_OUTSIDE_ZONE;
      return this.created(res, resultDto, message);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADDRESS_ADD_FAILED;
      next(error);
    }
  };

  getMyAddresses = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = this.getUserId(req);

      const addressDtos = await this._getAddressesUseCase.execute(userId);
      return this.ok(res, addressDtos);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADDRESS_FETCH_FAILED;
      next(error);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = this.getUserId(req);
      await this._deleteAddressUseCase.execute(req.params.id, userId);
      return this.ok(res, null, SuccessMessages.ADDRESS_DELETED);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADDRESS_DELETE_FAILED;
      next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = this.getUserId(req);
      const resultDto = await this._updateAddressUseCase.execute(req.params.id, userId, req.body);
      return this.ok(res, resultDto, SuccessMessages.ADDRESS_UPDATED);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADDRESS_UPDATE_FAILED;
      next(error);
    }
  };

  setDefaultAddress = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = this.getUserId(req);
      await this._updateAddressUseCase.execute(req.params.id, userId, { isDefault: true });
      return this.ok(res, null, SuccessMessages.DEFAULT_ADDRESS_UPDATED);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ADDRESS_UPDATE_FAILED;
      next(error);
    }
  };
}