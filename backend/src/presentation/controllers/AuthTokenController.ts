import type { Request, Response } from "express";
import { refreshCookieOptions } from "../../infrastructure/config/Cookie";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshTokenUseCase";

import { ErrorMessages } from "../../../../shared/types/enums/ErrorMessages";
import { StatusCodes } from "../../../../shared/types/enums/StatusCodes";

export class AuthTokenController {
  constructor(private readonly _refreshTokenUseCase: RefreshTokenUseCase) {}

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

    } catch (err: any) {
      res.clearCookie("refreshToken", {
        path: refreshCookieOptions.path || "/",
      });

      if (err.message === ErrorMessages.ACCOUNT_BLOCKED) {
        return res.status(StatusCodes.FORBIDDEN).json({ 
          error: ErrorMessages.ACCOUNT_BLOCKED 
        });
      }

      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: ErrorMessages.UNAUTHORIZED });
    }
  };
}

export default AuthTokenController;