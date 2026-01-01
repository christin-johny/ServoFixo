import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import { CreateAddressDto } from "../../../application/dto/address/CreateAddressDto";
import { UpdateAddressDto } from "../../../application/dto/address/UpdateAddressDto";
import { ILogger } from "../../../application/interfaces/ILogger"; 
import { LogEvents } from "../../../../../shared/constants/LogEvents"; 
import { SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes"; 
interface AddressResultDto {
  isServiceable: boolean;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  userId?: string; 
}

export class CustomerAddressController {
  constructor(
    private readonly _addAddressUseCase: IUseCase<AddressResultDto, [CreateAddressDto, string]>,
    private readonly _updateAddressUseCase: IUseCase<AddressResultDto, [string, string, UpdateAddressDto]>,
    private readonly _getAddressesUseCase: IUseCase<unknown[], [string]>, 
    private readonly _deleteAddressUseCase: IUseCase<void, [string, string]>,
    private readonly _logger: ILogger 
  ) {}

  addAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      const dto = req.body as CreateAddressDto;
      
      this._logger.info(LogEvents.ADDRESS_ADD_INIT, { userId, dto });

      const resultDto = await this._addAddressUseCase.execute(dto, userId);

      const message = resultDto.isServiceable
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