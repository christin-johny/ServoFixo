// backend/src/presentation/controllers/AdminAuthController.ts

import { Request, Response } from 'express';
import { AdminLoginUseCase } from '../../application/use-cases/auth/AdminLoginUseCase';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';
/**
 * AdminAuthController
 *
 * Handles HTTP requests for admin authentication.
 */
export class AdminAuthController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase
  ) {}

  /**
   * POST /api/admin/auth/login
   *
   * Body: { email, password }
   * Response: { message, accessToken, refreshToken }
   */
  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.OK).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.adminLoginUseCase.execute({ email, password });

      return res.status(StatusCodes.OK).json({
        message: 'Admin logged in successfully',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err: any) {
      // Invalid credentials
      if (err instanceof Error && err.message === ErrorMessages.INVALID_CREDENTIALS) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.INVALID_CREDENTIALS });
      }

      console.error('Admin login error:', err);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}
