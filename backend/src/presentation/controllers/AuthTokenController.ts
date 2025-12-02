// backend/src/presentation/controllers/AuthTokenController.ts

import type { Request, Response } from 'express';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';
import { refreshCookieOptions } from '../../infrastructure/config/Cookie';

/**
 * AuthTokenController
 *
 * Handles token-related endpoints (refresh, logout).
 */
export class AuthTokenController {
  constructor(
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  /**
   * POST /refresh
   *
   * Reads refreshToken from httpOnly cookie.
   * Response: { accessToken }
   */
  refresh = async (req: Request, res: Response): Promise<Response> => {
    try {
      const tokenFromCookie = req.cookies?.refreshToken;

      if (!tokenFromCookie) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.refreshTokenUseCase.execute({ refreshToken: tokenFromCookie });

      // If the use case returns a rotated refresh token, set it in cookie
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      if (err instanceof Error && err.message === ErrorMessages.UNAUTHORIZED) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
      }

      console.error('Refresh token error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  /**
   * POST /logout
   *
   * Clears refresh cookie.
   */
  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Clear cookie (ensure path matches cookie set path)
      res.clearCookie('refreshToken', { path: refreshCookieOptions.path || '/' });
      return res.status(StatusCodes.OK).json({ message: 'Logged out' });
    } catch (err: any) {
      console.error('Logout error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}
