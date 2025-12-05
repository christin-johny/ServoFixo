// backend/src/presentation/controllers/AdminAuthController.ts
import redis from '../../infrastructure/redis/redisClient';
import { Request, Response } from 'express';
import { AdminLoginUseCase } from '../../application/use-cases/auth/AdminLoginUseCase';
import { ErrorMessages }  from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';
import { refreshCookieOptions } from '../../infrastructure/config/Cookie';

export class AdminAuthController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase
  ) {}

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.adminLoginUseCase.execute({ email, password });

      // Set refresh token in httpOnly cookie (do not expose in JSON)
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: 'Admin logged in successfully',
        accessToken: result.accessToken,
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

  logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    // Clear cookie regardless (best-effort)
    res.clearCookie('refreshToken', { path: refreshCookieOptions.path ?? '/' });

    if (refreshToken) {
      try {
        // delete the redis key where tokens are stored: refresh:<token>
        const redisKey = `refresh:${refreshToken}`;
        await redis.del(redisKey);
      } catch (redisErr) {
        // don't fail the whole request on Redis error — log and continue
        console.error('Error deleting refresh token from Redis (admin logout):', redisErr);
      }
    }

    return res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Admin logout error:', err);
    // still clear cookie as a fallback
    res.clearCookie('refreshToken', { path: refreshCookieOptions.path ?? '/' });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
  }
};
}
