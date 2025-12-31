import { Request, Response, NextFunction } from "express";
import { GetCustomerProfileUseCase } from "../../../application/use-cases/customer/GetCustomerProfileUseCase";
import { UpdateCustomerUseCase } from "../../../application/use-cases/customer/UpdateCustomerUseCase";
import { DeleteCustomerUseCase } from "../../../application/use-cases/customer/DeleteCustomerUseCase";
import { UploadAvatarUseCase } from "../../../application/use-cases/customer/UploadAvatarUseCase";
import { ChangePasswordUseCase } from "../../../application/use-cases/customer/ChangePasswordUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../../../shared/types/enums/ErrorMessages";


export class CustomerProfileController {
  constructor(
    private readonly _getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly _updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly _deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly _uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly _changePasswordUseCase: ChangePasswordUseCase
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      const profileData = await this._getCustomerProfileUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Something went wrong",
      });
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any)?.userId;
      if (!userId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      const updatedCustomer = await this._updateCustomerUseCase.execute(
        userId,
        req.body
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.PROFILE_UPDATED,
        data: {
          id: updatedCustomer.getId(),
          name: updatedCustomer.getName(),
          email: updatedCustomer.getEmail(),
          phone: updatedCustomer.getPhone(),
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorMessages.SOMETHING_WRONG,
      });
    }
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      const userId = (req as any)?.userId;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
        });
      }

      await this._changePasswordUseCase.execute(userId, req.body);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.CHANGE_PASSWORD_SUCCESS,
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
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

      await this._deleteCustomerUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.ACCOUNT_DELETED,
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
          message: ErrorMessages.UNAUTHORIZED,
        });
      }

      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: ErrorMessages.NO_FILE,
        });
      }

      const avatarUrl = await this._uploadAvatarUseCase.execute(userId, {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      });

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.PROFILE_UPDATED,
        data: { avatarUrl },
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  };
}