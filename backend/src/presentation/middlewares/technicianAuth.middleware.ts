// backend/src/presentation/middlewares/technicianAuth.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { IJwtService } from '../../application/services/IJwtService';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

/**
 * Factory that creates an Express middleware for protecting technician routes.
 *
 * Steps:
 * - Read Authorization: Bearer <token>
 * - Verify token via IJwtService
 * - Ensure payload.type === 'technician'
 * - Attach payload to req.user
 */
export function makeTechnicianAuthMiddleware(jwtService: IJwtService) {
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

      // 1️⃣ Verify access token
      const payload = await jwtService.verifyAccessToken(token);

      // 2️⃣ Ensure it's a technician token
      if (payload.type !== 'technician') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: ErrorMessages.FORBIDDEN,
        });
      }

      // 3️⃣ Attach to request object
      (req as any).user = payload; // { sub, roles, type }

      return next();
    } catch (err) {
     

      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: ErrorMessages.UNAUTHORIZED,
      });
    }
  };
}
