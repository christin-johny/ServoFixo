import { NextFunction, Request, Response } from "express"; 
import { StatusCodes } from "../../utils/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../application/constants/ErrorMessages";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { IChangePasswordUseCase, IDeleteCustomerUseCase, IGetCustomerProfileUseCase, IUpdateCustomerUseCase, IUploadAvatarUseCase } from "../../../application/interfaces/use-cases/customer/ICustomerUseCases";

 

export interface AuthenticatedRequest extends Request {
  userId?: string; 
}

export class CustomerProfileController {
  constructor(
    private readonly _getCustomerProfileUseCase: IGetCustomerProfileUseCase,
private readonly _updateCustomerUseCase: IUpdateCustomerUseCase,
private readonly _deleteCustomerUseCase: IDeleteCustomerUseCase,
private readonly _uploadAvatarUseCase: IUploadAvatarUseCase,
private readonly _changePasswordUseCase: IChangePasswordUseCase,
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: ErrorMessages.UNAUTHORIZED 
        });
      }

      const profileData = await this._getCustomerProfileUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: profileData,
      });
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.PROFILE_FETCH_FAILED;
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: ErrorMessages.UNAUTHORIZED 
        });
      }

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
      (error as Error & { logContext?: string }).logContext = LogEvents.PROFILE_UPDATE_FAILED;
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
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
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.PASSWORD_CHANGE_FAILED;
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
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
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.ACCOUNT_DELETE_FAILED;
      next(error);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
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
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.AVATAR_UPLOAD_FAILED;
      next(error);
    }
  };
}