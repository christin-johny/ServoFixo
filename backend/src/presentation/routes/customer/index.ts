import { Router } from 'express';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { makeCustomerAuthMiddleware } from '../../middlewares/customerAuth.middleware';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';

// --- Import Sub-Routers ---
import authRoutes from './auth.routes';       // ✅ Import Auth
import serviceRoutes from './service.routes'; // ✅ Import Services

const router = Router();

// Shared Middleware
const jwtService = new JwtService();
const customerAuth = makeCustomerAuthMiddleware(jwtService);

// =================================================================
// 1. MOUNT SUB-MODULES
// =================================================================

// Auth Routes -> /api/customer/auth/*
router.use('/auth', authRoutes);

// Service Routes -> /api/customer/services/*
router.use('/services', serviceRoutes);


// =================================================================
// 2. DIRECT ROUTES (e.g. Profile)
// =================================================================

/**
 * GET /api/customer/me
 */
router.get('/me', customerAuth, (req, res) => {
  const user = (req as any).user; 
  return res.status(StatusCodes.OK).json({
    message: 'Customer profile placeholder',
    user,
  });
});

export default router;