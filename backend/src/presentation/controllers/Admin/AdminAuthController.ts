import redis from "../../../infrastructure/redis/redisClient";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../application/constants/ErrorMessages";
import { StatusCodes } from "../../utils/StatusCodes";
import { refreshCookieOptions } from "../../../infrastructure/config/Cookie";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";

interface AdminLoginResult {
  accessToken: string;
  refreshToken: string;
}


export class AdminAuthController extends BaseController {
  constructor(
    private readonly _adminLoginUseCase: IUseCase<AdminLoginResult, [{ email: string; password: string }]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  login = async (req: Request, res: Response,next: NextFunction): Promise<Response|void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Error(ErrorMessages.MISSING_REQUIRED_FIELDS);
      }

      const result = await this._adminLoginUseCase.execute({ email, password });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }
      
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
     (err as Error & { logContext?: string }).logContext = `${LogEvents.AUTH_LOGIN_FAILED} (Admin)`;
      next(err);
    }
  };

  logout = async (req: Request, res: Response,next: NextFunction): Promise<Response|void> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      res.clearCookie("refreshToken", refreshCookieOptions);

      if (refreshToken) {
        try {
          await redis.del(`refresh:${refreshToken}`);
        } catch (redisErr: unknown) {
          this._logger.error("Error deleting refresh token from Redis", String(redisErr));
        }
      }
      
      //  Aligned with repository resp.data
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGOUT_SUCCESS,
      });
    } catch (err: unknown) {
      (err as Error & { logContext?: string }).logContext = "Admin Logout Error";
      next(err);
    }
  };
}