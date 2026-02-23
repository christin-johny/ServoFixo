import { NextFunction, Request, Response } from "express";
import { refreshCookieOptions } from "../../infrastructure/config/Cookie";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshTokenUseCase";
import { ErrorMessages } from "../../application/constants/ErrorMessages";
import { StatusCodes } from "../utils/StatusCodes";
import { ILogger } from "../../application/interfaces/ILogger";
import { LogEvents } from "../../infrastructure/logging/LogEvents";

export class AuthTokenController {
  constructor(
    private readonly _refreshTokenUseCase: RefreshTokenUseCase,
    private readonly _logger: ILogger
  ) {}

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (!refreshToken) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });
      }

      const result = await this._refreshTokenUseCase.execute(refreshToken);

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: "Token refreshed",
        accessToken: result.accessToken,
      });

    } catch (err: unknown) {
      // Logic for clearing cookie remains here as it's a specific requirement for refresh failure
      res.clearCookie("refreshToken", {
        path: refreshCookieOptions.path || "/",
      });

      (err as Error & { logContext?: string }).logContext = LogEvents.AUTH_REFRESH_FAILED;
      next(err);
    }
  };
}

export default AuthTokenController;