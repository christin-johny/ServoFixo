// backend/src/presentation/routes/technician.routes.ts

import { Router } from 'express';
import { JwtService } from '../../infrastructure/security/JwtService';
import { makeTechnicianAuthMiddleware } from '../middlewares/technicianAuth.middleware';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

const router = Router();

// Shared JwtService instance
const jwtService = new JwtService();

// Technician auth middleware instance
const technicianAuth = makeTechnicianAuthMiddleware(jwtService);

/**
 * Example protected route:
 * GET /api/technician/me
 *
 * Requires:
 * - Authorization: Bearer <accessToken> of type 'technician'
 */
router.get('/me', technicianAuth, (req, res) => {
  const user = (req as any).user; // { sub, roles, type }

  return res.status(StatusCodes.OK).json({
    message: 'Technician profile placeholder',
    user,
  });
});

export default router;
