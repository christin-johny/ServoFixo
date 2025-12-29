import { Request, Response, NextFunction } from "express";
import { GetCustomerProfileUseCase } from "../../../application/use-cases/customer/GetCustomerProfileUseCase";
import { UpdateCustomerUseCase } from "../../../application/use-cases/customer/UpdateCustomerUseCase";
import { DeleteCustomerUseCase } from "../../../application/use-cases/customer/DeleteCustomerUseCase";
import { UploadAvatarUseCase } from "../../../application/use-cases/customer/UploadAvatarUseCase";
import { ChangePasswordUseCase } from "../../../application/use-cases/customer/ChangePasswordUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class CustomerProfileController {
  constructor(
    private readonly getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      const profileData = await this.getCustomerProfileUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: error.message });
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      const updatedCustomer = await this.updateCustomerUseCase.execute(
        userId,
        req.body
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: updatedCustomer.getId(),
          name: updatedCustomer.getName(),
          email: updatedCustomer.getEmail(),
          phone: updatedCustomer.getPhone(),
        },
      });
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
  };
  changePassword = async (req: Request, res: Response) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: ErrorMessages.UNAUTHORIZED 
        });
      }

      await this.changePasswordUseCase.execute(userId, req.body);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Password changed successfully."
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
        });
      }

      await this.deleteCustomerUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Account deleted successfully. We are sorry to see you go.",
      });
    } catch (error) {
      next(error);
    }
  };

uploadAvatar = async (req: Request, res: Response) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: ErrorMessages.UNAUTHORIZED 
        });
      }

      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: "No file uploaded" 
        });
      }

      const avatarUrl = await this.uploadAvatarUseCase.execute(userId, {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      });

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: { avatarUrl }
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: error.message 
      });
    }
  };
}

