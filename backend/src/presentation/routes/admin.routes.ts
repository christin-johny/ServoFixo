// backend/src/presentation/routes/admin.routes.ts

import { Router } from 'express';
import { JwtService } from '../../infrastructure/security/JwtService';
import { makeAdminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

const router = Router();

// Reuse same JwtService config
const jwtService = new JwtService();

// Create the admin auth middleware instance
const adminAuth = makeAdminAuthMiddleware(jwtService);

/**
 * Example protected route:
 * GET /api/admin/dashboard
 *
 * Requires:
 * - Authorization: Bearer <accessToken>
 * - Token with payload.type === 'admin'
 */
router.get('/dashboard', adminAuth, (req, res) => {
  const user = (req as any).user;

  return res.status(StatusCodes.OK).json({
    message: 'Admin dashboard data',
    user, // payload from JWT
  });
});

export default router;
