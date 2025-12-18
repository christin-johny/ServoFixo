import { Request, Response } from "express";
import { AddAddressUseCase } from "../../../application/use-cases/address/AddAddressUseCase";
import { UpdateAddressUseCase } from "../../../application/use-cases/address/UpdateAddressUseCase";
import { GetMyAddressesUseCase } from "../../../application/use-cases/address/GetMyAddressesUseCase";
import { DeleteAddressUseCase } from "../../../application/use-cases/address/DeleteAddressUseCase";
import { SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class CustomerAddressController {
  constructor(
    private addAddressUseCase: AddAddressUseCase,
    private updateAddressUseCase: UpdateAddressUseCase,
    private getMyAddressesUseCase: GetMyAddressesUseCase,
    private deleteAddressUseCase: DeleteAddressUseCase
  ) {}

  async addAddress(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const address = await this.addAddressUseCase.execute({
        ...req.body,
        userId,
      });

      const message = address.getIsServiceable()
        ? "Address added successfully!"
        : "Address saved, but it is currently outside our service area.";

      return res.status(201).json({ success: true, message, data: address });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyAddresses(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const addresses = await this.getMyAddressesUseCase.execute(userId);

      return res.status(200).json({ success: true, data: addresses });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      await this.deleteAddressUseCase.execute(id, userId);

      return res.status(200).json({ success: true, message: SuccessMessages.ADDRESS_DELETED });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateAddress(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const address = await this.updateAddressUseCase.execute(id, userId, req.body);

      return res.status(200).json({
        success: true,
        message: SuccessMessages.ADDRESS_UPDATED,
        data: address,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async setDefaultAddress(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      await this.updateAddressUseCase.execute(id, userId, { isDefault: true });

      return res.status(200).json({ success: true, message: SuccessMessages.DEFAULT_ADDRESS_UPDATED });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}