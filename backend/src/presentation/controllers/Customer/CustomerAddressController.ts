// src/presentation/controllers/Customer/CustomerAddressController.ts
import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import { CreateAddressDto } from "../../../application/dto/address/CreateAddressDto";
import { UpdateAddressDto } from "../../../application/dto/address/UpdateAddressDto"; 
import { AddressResponseDto } from "../../../application/dto/address/AddressResponseDto"; 
import { ILogger } from "../../../application/interfaces/ILogger"; 
import { LogEvents } from "../../../../../shared/constants/LogEvents"; 
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages"; 

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

  addAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getUserId(req);
      const dto = req.body as CreateAddressDto;

      const resultDto = await this._addAddressUseCase.execute(dto, userId); 
      const isServiceable = (resultDto as any).isServiceable ?? true;

      const message = isServiceable ? SuccessMessages.ADDRESS_ADDED : SuccessMessages.ADDRESS_OUTSIDE_ZONE;
      return this.created(res, resultDto, message);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.ADDRESS_ADD_FAILED);
    }
  };

  getMyAddresses = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getUserId(req);

      const addressDtos = await this._getAddressesUseCase.execute(userId);
      return this.ok(res, addressDtos);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.ADDRESS_FETCH_FAILED);
    }
  };

  deleteAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getUserId(req);
      await this._deleteAddressUseCase.execute(req.params.id, userId);
      return this.ok(res, null, SuccessMessages.ADDRESS_DELETED);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.ADDRESS_DELETE_FAILED);
    }
  };

  updateAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getUserId(req);
      const resultDto = await this._updateAddressUseCase.execute(req.params.id, userId, req.body);
      return this.ok(res, resultDto, SuccessMessages.ADDRESS_UPDATED);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.ADDRESS_UPDATE_FAILED);
    }
  };

  setDefaultAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getUserId(req);
      await this._updateAddressUseCase.execute(req.params.id, userId, { isDefault: true });
      return this.ok(res, null, SuccessMessages.DEFAULT_ADDRESS_UPDATED);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.ADDRESS_UPDATE_FAILED);
    }
  };
}