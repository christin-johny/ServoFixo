import type { Request, Response } from "express";
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

  refresh = async (req: Request, res: Response): Promise<Response> => {
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
  const errorMessage =
    err instanceof Error ? err.message : String(err);

  this._logger.error(
    LogEvents.AUTH_REFRESH_FAILED,
    errorMessage
  );

  res.clearCookie("refreshToken", {
    path: refreshCookieOptions.path || "/",
  });

  if (errorMessage === ErrorMessages.ACCOUNT_BLOCKED) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: ErrorMessages.ACCOUNT_BLOCKED
    });
  }

  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ error: ErrorMessages.UNAUTHORIZED });
}

}
}

export default AuthTokenController;