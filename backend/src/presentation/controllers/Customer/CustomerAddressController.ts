import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import { CreateAddressDto } from "../../../application/dto/address/CreateAddressDto";
import { UpdateAddressDto } from "../../../application/dto/address/UpdateAddressDto";
// ✅ Import the actual DTO
import { AddressResponseDto } from "../../../application/dto/address/AddressResponseDto"; 
import { ILogger } from "../../../application/interfaces/ILogger"; 
import { LogEvents } from "../../../../../shared/constants/LogEvents"; 
import { SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes"; 

export interface AuthenticatedRequest extends Request {
  userId?: string; 
}

export class CustomerAddressController {
  constructor(
    // ✅ FIX: Match AddAddressUseCase return type
    private readonly _addAddressUseCase: IUseCase<AddressResponseDto, [CreateAddressDto, string]>,
    
    // ✅ FIX: Match UpdateAddressUseCase return type
    private readonly _updateAddressUseCase: IUseCase<AddressResponseDto, [string, string, UpdateAddressDto]>,
    
    // ✅ FIX: Match GetAddressesUseCase return type
    private readonly _getAddressesUseCase: IUseCase<AddressResponseDto[], [string]>, 
    
    // ✅ FIX: Match DeleteAddressUseCase return type (it returns Promise<boolean>)
    private readonly _deleteAddressUseCase: IUseCase<boolean, [string, string]>,
    
    private readonly _logger: ILogger 
  ) {}

  addAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      const dto = req.body as CreateAddressDto;
      
      this._logger.info(LogEvents.ADDRESS_ADD_INIT, { userId, dto });

      const resultDto = await this._addAddressUseCase.execute(dto, userId);

      // Accessing isServiceable. Ensure your AddressResponseDto definition includes this field.
      // If it's strictly defined in the DTO, you don't need 'as any'. 
      // Using 'as any' here as a safety net in case the DTO definition excludes it but the object has it.
      const isServiceable = (resultDto as any).isServiceable ?? true;

      const message = isServiceable
        ? SuccessMessages.ADDRESS_ADDED
        : SuccessMessages.ADDRESS_OUTSIDE_ZONE;

      return res.status(StatusCodes.CREATED).json({ 
        success: true, 
        message, 
        data: resultDto 
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.ADDRESS_ADD_FAILED, undefined, { error });
      const msg = error instanceof Error ? error.message : 'Unknown Error';
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: msg });
    }
  };

  getMyAddresses = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      this._logger.info(LogEvents.ADDRESS_FETCH_ALL, { userId });

      const addressDtos = await this._getAddressesUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        data: addressDtos 
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.ADDRESS_FETCH_FAILED, undefined, { error });
      const msg = error instanceof Error ? error.message : 'Unknown Error';
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: msg });
    }
  };

  deleteAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      this._logger.info(LogEvents.ADDRESS_DELETE_INIT, { addressId: id, userId });

      await this._deleteAddressUseCase.execute(id, userId);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: SuccessMessages.ADDRESS_DELETED 
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.ADDRESS_DELETE_FAILED, undefined, { error, addressId: req.params.id });
      const msg = error instanceof Error ? error.message : 'Unknown Error';
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: msg });
    }
  };

  updateAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      const dto = req.body as UpdateAddressDto;

      this._logger.info(LogEvents.ADDRESS_UPDATE_INIT, { addressId: id, userId });

      const resultDto = await this._updateAddressUseCase.execute(id, userId, dto);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.ADDRESS_UPDATED,
        data: resultDto,
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.ADDRESS_UPDATE_FAILED, undefined, { error, addressId: req.params.id });
      const msg = error instanceof Error ? error.message : 'Unknown Error';
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: msg });
    }
  };

  setDefaultAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      this._logger.info(LogEvents.ADDRESS_SET_DEFAULT, { addressId: id, userId });

      const dto: UpdateAddressDto = { isDefault: true };

      await this._updateAddressUseCase.execute(id, userId, dto);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: SuccessMessages.DEFAULT_ADDRESS_UPDATED 
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown Error';
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: msg });
    }
  };
}