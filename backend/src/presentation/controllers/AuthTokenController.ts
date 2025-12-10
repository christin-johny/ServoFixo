// server/controllers/AuthTokenController.ts
import type { Request, Response } from "express";
import { refreshCookieOptions } from "../../infrastructure/config/Cookie";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshTokenUseCase";

export class AuthTokenController {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {}

  refresh = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token" });
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);

      // Set new refresh cookie (rotation)
      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
        // result.refreshToken was already stored by use-case
      }

      return res.status(200).json({
        message: "Token refreshed",
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      res.clearCookie("refreshToken", { path: refreshCookieOptions.path || "/" });
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}

export default AuthTokenController;
