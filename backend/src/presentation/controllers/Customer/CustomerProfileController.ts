import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

interface ICustomerEntity {
  getId(): string;
  getName(): string;
  getEmail(): string;
  getPhone(): string | undefined;  
}

export interface AuthenticatedRequest extends Request {
  userId?: string; 
}

export class CustomerProfileController {
  constructor(
    private readonly _getCustomerProfileUseCase: IUseCase<unknown, [string]>,
    private readonly _updateCustomerUseCase: IUseCase<ICustomerEntity, [string, unknown]>,
    private readonly _deleteCustomerUseCase: IUseCase<void, [string]>,
    private readonly _uploadAvatarUseCase: IUseCase<string, [string, { buffer: Buffer; originalName: string; mimeType: string }]>,
    private readonly _changePasswordUseCase: IUseCase<void, [string, unknown]>,
    private readonly _logger: ILogger
  ) {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: ErrorMessages.UNAUTHORIZED });

          

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
 
      const updatedFields = req.body ? Object.keys(req.body) : [];
      

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

      

      await this._deleteCustomerUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.ACCOUNT_DELETED,
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.ACCOUNT_DELETE_FAILED, undefined, { error });
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