import { Request, Response } from "express";
import { StatusCodes } from "../../utils/StatusCodes";
import { refreshCookieOptions } from "../../../infrastructure/config/Cookie";
import { ErrorMessages, SuccessMessages } from "../../../application/constants/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import redis from "../../../infrastructure/redis/redisClient";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { 
  TechnicianRegisterInitDto, 
  TechnicianRegisterVerifyDto,
  TechnicianForgotPasswordInitDto,   
  TechnicianForgotPasswordVerifyDto  
} from "../../../application/dto/technician/TechnicianAuthDtos";
import { TechnicianLoginDto } from "../../../application/use-cases/technician/auth/TechnicianLoginUseCase";
import { AuthResultDto } from "../../../application/dto/auth/AuthResultDto";

interface OtpResponse {
  message: string;
  sessionId: string;
}

export class TechnicianAuthController {
  constructor(
    private readonly _requestOtpUseCase: IUseCase<OtpResponse, [TechnicianRegisterInitDto]>,
    private readonly _verifyOtpUseCase: IUseCase<AuthResultDto, [TechnicianRegisterVerifyDto]>,
    private readonly _loginUseCase: IUseCase<AuthResultDto, [TechnicianLoginDto]>,
    private readonly _requestForgotOtpUseCase: IUseCase<OtpResponse, [TechnicianForgotPasswordInitDto]>,
    private readonly _verifyForgotOtpUseCase: IUseCase<{ message: string }, [TechnicianForgotPasswordVerifyDto]>,
    
    private readonly _logger: ILogger
  ) {}
 
  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      const result = await this._requestOtpUseCase.execute(req.body);
       
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.OTP_SENT,
        sessionId: result.sessionId
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.AUTH_REGISTER_FAILED, errorMessage);
      if (
        errorMessage === ErrorMessages.EMAIL_ALREADY_EXISTS ||
        errorMessage === ErrorMessages.PHONE_ALREADY_EXISTS
      ) {
        return res.status(StatusCodes.CONFLICT).json({ error: errorMessage });
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
  };
 
  verifyRegistration = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      const result = await this._verifyOtpUseCase.execute(req.body);
      
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      
      
      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.REGISTRATION_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.AUTH_OTP_VERIFY_FAILED, errorMessage);
      if (
        errorMessage === ErrorMessages.OTP_INVALID ||
        errorMessage === ErrorMessages.OTP_SESSION_INVALID
      ) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: errorMessage });
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
  };
 
  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      const result = await this._loginUseCase.execute(req.body);
      
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      
      
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.AUTH_LOGIN_FAILED, errorMessage);
      if (errorMessage === ErrorMessages.INVALID_CREDENTIALS) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: errorMessage });
      }
      if (errorMessage === ErrorMessages.ACCOUNT_BLOCKED) {
        return res.status(StatusCodes.FORBIDDEN).json({ error: errorMessage });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
 
  forgotPasswordInitOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      const result = await this._requestForgotOtpUseCase.execute(req.body);
      
      return res.status(StatusCodes.OK).json({
          message: SuccessMessages.OTP_SENT,
          sessionId: result.sessionId
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.AUTH_FORGOT_PASS_INIT_FAILED, errorMessage);
      
      if (errorMessage === ErrorMessages.TECHNICIAN_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
  };
 
  forgotPasswordVerifyOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this._verifyForgotOtpUseCase.execute(req.body);
      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.AUTH_FORGOT_PASS_VERIFY_FAILED, errorMessage);

      if (errorMessage === ErrorMessages.OTP_INVALID || errorMessage === ErrorMessages.OTP_SESSION_INVALID) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: errorMessage });
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
  };
 
  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (refreshToken) {
        try {
          await redis.del(`refresh:${refreshToken}`);
        } catch (err: unknown) {
          this._logger.error("Failed to delete refresh token from redis", String(err));
        }
      }
      res.clearCookie("refreshToken", refreshCookieOptions);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.LOGOUT_SUCCESS });
    } catch (err: unknown) {
      this._logger.error(LogEvents.AUTH_LOGOUT_FAILED, String(err));
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}