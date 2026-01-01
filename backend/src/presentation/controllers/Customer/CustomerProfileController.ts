import { Request, Response } from "express";
import { GetCustomerProfileUseCase } from "../../../application/use-cases/customer/GetCustomerProfileUseCase";
import { UpdateCustomerUseCase } from "../../../application/use-cases/customer/UpdateCustomerUseCase";
import { DeleteCustomerUseCase } from "../../../application/use-cases/customer/DeleteCustomerUseCase";
import { UploadAvatarUseCase } from "../../../application/use-cases/customer/UploadAvatarUseCase";
import { ChangePasswordUseCase } from "../../../application/use-cases/customer/ChangePasswordUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export interface AuthenticatedRequest extends Request {
  userId?: string; 
}

export class CustomerProfileController {
  constructor(
    private readonly _getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly _updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly _deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly _uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly _changePasswordUseCase: ChangePasswordUseCase,
    private readonly _logger: ILogger
  ) {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      this._logger.info(LogEvents.PROFILE_FETCH_INIT, { userId });

      const profileData = await this._getCustomerProfileUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: profileData,
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.PROFILE_FETCH_FAILED, undefined, { error });
      
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

  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: ErrorMessages.UNAUTHORIZED });

      // Only log keys to prevent PII leakage
      const updatedFields = req.body ? Object.keys(req.body) : [];
      this._logger.info(LogEvents.PROFILE_UPDATE_INIT, { userId, updatedFields });

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
      this._logger.error(LogEvents.PROFILE_UPDATE_FAILED, undefined, { error });
      
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

  changePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
        });
      }

      this._logger.info(LogEvents.PASSWORD_CHANGE_INIT, { userId });

      await this._changePasswordUseCase.execute(userId, req.body);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.CHANGE_PASSWORD_SUCCESS,
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.PASSWORD_CHANGE_FAILED, undefined, { error });
      const msg = error instanceof Error ? error.message : ErrorMessages.SOMETHING_WRONG;
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  };

  deleteAccount = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: ErrorMessages.UNAUTHORIZED,
        });
      }

      this._logger.info(LogEvents.ACCOUNT_DELETE_INIT, { userId });

      await this._deleteCustomerUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.ACCOUNT_DELETED,
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.ACCOUNT_DELETE_FAILED, undefined, { error });
      // Depending on your global strategy, you might want next(error) here, 
      // but sticking to the file pattern which uses manual response:
      const msg = error instanceof Error ? error.message : 'Unknown Error';
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: msg });
    }
  };

  uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
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

      this._logger.info(LogEvents.AVATAR_UPLOAD_INIT, { 
        userId, 
        fileName: req.file.originalname, 
        mimeType: req.file.mimetype 
      });

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
      this._logger.error(LogEvents.AVATAR_UPLOAD_FAILED, undefined, { error });
      const msg = error instanceof Error ? error.message : ErrorMessages.SOMETHING_WRONG;
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  };
}