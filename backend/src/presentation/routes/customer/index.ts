import { Router } from 'express';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { makeCustomerAuthMiddleware } from '../../middlewares/customerAuth.middleware';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';

// --- Import Sub-Routers ---
import authRoutes from './auth.routes';       // ✅ Import Auth
import serviceRoutes from './service.routes'; // ✅ Import Services
import categoryRoutes from './category.routes';

const router = Router();

const jwtService = new JwtService();
const customerAuth = makeCustomerAuthMiddleware(jwtService);


// Auth Routes -> /api/customer/auth/*
router.use('/auth', authRoutes);

// Service Routes -> /api/customer/services/*
router.use('/services', serviceRoutes);

router.use('/categories', categoryRoutes);


export default router;