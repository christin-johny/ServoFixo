// backend/src/presentation/middlewares/customerAuth.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { IJwtService } from '../../application/services/IJwtService';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

/**
 * Factory that creates an Express middleware for protecting customer routes.
 *
 * Steps:
 * - Read Authorization: Bearer <token>
 * - Verify token via IJwtService
 * - Ensure payload.type === 'customer'
 * - Attach payload to req.user
 */
export function makeCustomerAuthMiddleware(jwtService: IJwtService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.UNAUTHORIZED,
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.UNAUTHORIZED,
        });
      }

      const payload = await jwtService.verifyAccessToken(token);
      if (payload.type !== 'customer') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: ErrorMessages.FORBIDDEN,
        });
      }
      
      (req as any).userId = payload.sub; 

      return next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: ErrorMessages.UNAUTHORIZED,
      });
    }
  };
}
