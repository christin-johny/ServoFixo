import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "../../utils/StatusCodes";
import { refreshCookieOptions } from "../../../infrastructure/config/Cookie";
import {  SuccessMessages } from "../../../application/constants/ErrorMessages";
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
 
  register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await this._requestOtpUseCase.execute(req.body);
       
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.OTP_SENT,
        sessionId: result.sessionId
      });
    } catch (err: unknown) {
      (err as Error & { logContext?: string }).logContext = LogEvents.AUTH_REGISTER_FAILED;
      next(err);
    }
  };
 
  verifyRegistration = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await this._verifyOtpUseCase.execute(req.body);
      
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      
      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.REGISTRATION_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      (err as Error & { logContext?: string }).logContext = LogEvents.AUTH_OTP_VERIFY_FAILED;
      next(err);
    }
  };
 
  login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await this._loginUseCase.execute(req.body);
      
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      (err as Error & { logContext?: string }).logContext = LogEvents.AUTH_LOGIN_FAILED;
      next(err);
    }
  };
 
  forgotPasswordInitOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await this._requestForgotOtpUseCase.execute(req.body);
      
      return res.status(StatusCodes.OK).json({
          message: SuccessMessages.OTP_SENT,
          sessionId: result.sessionId
      });
    } catch (err: unknown) {
      (err as Error & { logContext?: string }).logContext = LogEvents.AUTH_FORGOT_PASS_INIT_FAILED;
      next(err);
    }
  };
 
  forgotPasswordVerifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await this._verifyForgotOtpUseCase.execute(req.body);
      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      (err as Error & { logContext?: string }).logContext = LogEvents.AUTH_FORGOT_PASS_VERIFY_FAILED;
      next(err);
    }
  };
 
  logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
      (err as Error & { logContext?: string }).logContext = LogEvents.AUTH_LOGOUT_FAILED;
      next(err);
    }
  };
}