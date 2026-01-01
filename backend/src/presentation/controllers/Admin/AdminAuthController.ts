import redis from "../../../infrastructure/redis/redisClient";
import { Request, Response } from "express";
import { AdminLoginUseCase } from "../../../application/use-cases/auth/AdminLoginUseCase";
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../../../shared/types/enums/ErrorMessages";

import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { refreshCookieOptions } from "../../../infrastructure/config/Cookie";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class AdminAuthController {
  constructor(
    private readonly _adminLoginUseCase: AdminLoginUseCase,
    private readonly _logger: ILogger
  ) {}

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(`${LogEvents.AUTH_LOGIN_INIT} (Admin)`);
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this._adminLoginUseCase.execute({ email, password });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }

      this._logger.info(
        `${LogEvents.AUTH_LOGIN_SUCCESS} (Admin) - Email: ${email}`
      );
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      this._logger.error(`${LogEvents.AUTH_LOGIN_FAILED} (Admin)`, err);
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
        } catch (redisErr: unknown) {
          const errorMessage =
            redisErr instanceof Error ? redisErr.message : String(redisErr);

          this._logger.error(
            "Error deleting refresh token from Redis (admin logout):",
            errorMessage
          );
        }
      }

      this._logger.info(`${LogEvents.AUTH_LOGOUT_SUCCESS} (Admin)`);
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGOUT_SUCCESS,
      });
    } catch (err: unknown) {
  const errorMessage =
    err instanceof Error ? err.message : String(err);

  this._logger.error(
    "Admin Logout Error",
    errorMessage
  );

  res.clearCookie("refreshToken", {
    path: refreshCookieOptions.path ?? "/",
  });

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: ErrorMessages.INTERNAL_ERROR,
  });
}

  };
}
