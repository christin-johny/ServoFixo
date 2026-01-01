import { Request, Response } from "express";
import { AddAddressUseCase } from "../../../application/use-cases/address/AddAddressUseCase";
import { UpdateAddressUseCase } from "../../../application/use-cases/address/UpdateAddressUseCase";
import { GetAddressesUseCase } from "../../../application/use-cases/address/GetAddressesUseCase";
import { DeleteAddressUseCase } from "../../../application/use-cases/address/DeleteAddressUseCase";
import { CreateAddressDto } from "../../../application/dto/address/CreateAddressDto";
import { UpdateAddressDto } from "../../../application/dto/address/UpdateAddressDto";
import { SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages"; // Adjust path as needed
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes"; // Adjust path as needed

// 1. Strict Request Type (No 'any' for userId)
export interface AuthenticatedRequest extends Request {
  userId?: string; // Populated by your Auth Middleware
}

export class CustomerAddressController {
  constructor(
    private _addAddressUseCase: AddAddressUseCase,
    private _updateAddressUseCase: UpdateAddressUseCase,
    private _getAddressesUseCase: GetAddressesUseCase,
    private _deleteAddressUseCase: DeleteAddressUseCase
  ) {}

  /**
   * CREATE ADDRESS
   */
  addAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      // Validate this with middleware (e.g. class-validator) in production
      const dto = req.body as CreateAddressDto;

      const resultDto = await this._addAddressUseCase.execute(dto, userId);

      const message = resultDto.isServiceable
        ? SuccessMessages.ADDRESS_ADDED
        : SuccessMessages.ADDRESS_OUTSIDE_ZONE;

      return res.status(StatusCodes.CREATED).json({ 
        success: true, 
        message, 
        data: resultDto 
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  };

  /**
   * GET ALL ADDRESSES
   */
  getMyAddresses = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      // Use Case now returns AddressResponseDto[], not Entities
      const addressDtos = await this._getAddressesUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        data: addressDtos 
      });
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
  };

  /**
   * DELETE ADDRESS
   */
  deleteAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      await this._deleteAddressUseCase.execute(id, userId);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: SuccessMessages.ADDRESS_DELETED 
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  };

  /**
   * UPDATE ADDRESS
   */
  updateAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      const dto = req.body as UpdateAddressDto;

      const resultDto = await this._updateAddressUseCase.execute(id, userId, dto);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.ADDRESS_UPDATED,
        data: resultDto,
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  };

  /**
   * SET DEFAULT ADDRESS
   * Note: This reuses UpdateAddressUseCase but forces a specific DTO.
   */
  setDefaultAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) throw new Error("Unauthorized");

      // Construct a strict DTO for this specific action
      const dto: UpdateAddressDto = { isDefault: true };

      await this._updateAddressUseCase.execute(id, userId, dto);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: SuccessMessages.DEFAULT_ADDRESS_UPDATED 
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  };
}