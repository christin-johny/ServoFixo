// backend/src/presentation/controllers/AuthTokenController.ts

import type { Request, Response } from 'express';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

/**
 * AuthTokenController
 *
 * Handles token-related endpoints (refresh, later maybe logout/revoke).
 */
export class AuthTokenController {
  constructor(
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  /**
   * POST /refresh
   *
   * Body: { refreshToken }
   * Response: { accessToken, refreshToken }
   *
   * Works for any user type (admin/customer/technician).
   */
  refresh = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.refreshTokenUseCase.execute({ refreshToken });

      return res.status(StatusCodes.OK).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
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
}
