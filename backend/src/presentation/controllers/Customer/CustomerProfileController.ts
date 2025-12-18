import { Request, Response, NextFunction } from "express";
import { GetCustomerProfileUseCase } from "../../../application/use-cases/customer/GetCustomerProfileUseCase";
import { UpdateCustomerUseCase } from "../../../application/use-cases/customer/UpdateCustomerUseCase";
import { DeleteCustomerUseCase } from "../../../application/use-cases/customer/DeleteCustomerUseCase"; // 🟢 Import this
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class CustomerProfileController {
  constructor(
    private readonly getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase
  ) {}

  // 🔵 GET /profile (Existing)
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      const profileData = await this.getCustomerProfileUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      next(error);
    }
  };

  // 🟡 PUT /profile (New)
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      // We pass the userId and the body (name, phone, etc.) to the existing use case
      const updatedCustomer = await this.updateCustomerUseCase.execute(userId, req.body);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            id: updatedCustomer.getId(),
            name: updatedCustomer.getName(),
            email: updatedCustomer.getEmail(),
            phone: updatedCustomer.getPhone()
        }
      });
    } catch (error) {
      next(error);
    }
  };
  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
        });
      }

      // Execute the deletion using the ID from the token
      await this.deleteCustomerUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Account deleted successfully. We are sorry to see you go.",
      });
    } catch (error) {
      next(error);
    }
  };
}