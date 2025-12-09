// backend/src/presentation/routes/customer.routes.ts

import { Router } from 'express';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { makeCustomerAuthMiddleware } from '../../middlewares/customerAuth.middleware';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';

const router = Router();

// Shared JwtService instance
const jwtService = new JwtService();

// Customer auth middleware instance
const customerAuth = makeCustomerAuthMiddleware(jwtService);

/**
 * Example protected route:
 * GET /api/customer/me
 *
 * Requires:
 * - Authorization: Bearer <accessToken> of type 'customer'
 */
router.get('/me', customerAuth, (req, res) => {
  const user = (req as any).user; // { sub, roles, type }

  return res.status(StatusCodes.OK).json({
    message: 'Customer profile placeholder',
    user,
  });
});

export default router;
