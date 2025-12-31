import { Request, Response } from "express";
import { AddAddressUseCase } from "../../../application/use-cases/address/AddAddressUseCase";
import { UpdateAddressUseCase } from "../../../application/use-cases/address/UpdateAddressUseCase";
import { GetAddressesUseCase } from "../../../application/use-cases/address/GetAddressesUseCase";
import { DeleteAddressUseCase } from "../../../application/use-cases/address/DeleteAddressUseCase";
import { SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

export class CustomerAddressController {
  constructor(
    private _addAddressUseCase: AddAddressUseCase,
    private _updateAddressUseCase: UpdateAddressUseCase,
    private _getAddressesUseCase: GetAddressesUseCase,
    private _deleteAddressUseCase: DeleteAddressUseCase
  ) {}

  addAddress=async (req: Request, res: Response): Promise<Response> =>{
    try {
      const userId = (req as any).userId;
      const address = await this._addAddressUseCase.execute({
        ...req.body,
        userId,
      });

      const message = address.getIsServiceable()
        ? SuccessMessages.ADDRESS_ADDED
        : SuccessMessages.ADDRESS_OUTSIDE_ZONE;

      return res.status(StatusCodes.CREATED).json({ success: true, message, data: address });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  }

  getMyAddresses=async (req: Request, res: Response): Promise<Response> =>{
    try {
      const userId = (req as any).userId;
      const addresses = await this._getAddressesUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({ success: true, data: addresses });
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
  }

  deleteAddress=async (req: Request, res: Response): Promise<Response> =>{
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      await this._deleteAddressUseCase.execute(id, userId);

      return res.status(StatusCodes.OK).json({ success: true, message: SuccessMessages.ADDRESS_DELETED });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  }

  updateAddress =async (req: Request, res: Response): Promise<Response> =>{
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const address = await this._updateAddressUseCase.execute(id, userId, req.body);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.ADDRESS_UPDATED,
        data: address,
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  }

 setDefaultAddress= async (req: Request, res: Response): Promise<Response>=> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      await this._updateAddressUseCase.execute(id, userId, { isDefault: true });

      return res.status(StatusCodes.OK).json({ success: true, message: SuccessMessages.DEFAULT_ADDRESS_UPDATED });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  }
}