// backend/src/presentation/middlewares/adminAuth.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { IJwtService } from '../../application/services/IJwtService';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

export function makeAdminAuthMiddleware(jwtService: IJwtService) {
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

      // 2️⃣ Ensure this is an admin token
      if (payload.type !== 'admin') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: ErrorMessages.FORBIDDEN,
        });
      }

      // 3️⃣ Attach payload to request object for later use
      // TypeScript note: we cast to any to avoid extending Express types for now.
      (req as any).user = payload;

      // 4️⃣ Pass control to the next handler
      return next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: ErrorMessages.UNAUTHORIZED,
      });
    }
  };
}
