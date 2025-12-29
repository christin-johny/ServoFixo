import redis from "../../../infrastructure/redis/redisClient";
import { Request, Response } from "express";
import { AdminLoginUseCase } from "../../../application/use-cases/auth/AdminLoginUseCase";
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../../../shared/types/enums/ErrorMessages";

import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { refreshCookieOptions } from "../../../infrastructure/config/Cookie";

export class AdminAuthController {
  constructor(private readonly adminLoginUseCase: AdminLoginUseCase) {}

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.adminLoginUseCase.execute({ email, password });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message === ErrorMessages.INVALID_CREDENTIALS
      ) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: ErrorMessages.INVALID_CREDENTIALS,
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      res.clearCookie("refreshToken", refreshCookieOptions);

      if (refreshToken) {
        try {
          const redisKey = `refresh:${refreshToken}`;
          await redis.del(redisKey);
        } catch (redisErr) {
          console.error(
            "Error deleting refresh token from Redis (admin logout):",
            redisErr
          );
        }
      }

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGOUT_SUCCESS,
      });
    } catch (err) {
      res.clearCookie("refreshToken", {
        path: refreshCookieOptions.path ?? "/",
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}
