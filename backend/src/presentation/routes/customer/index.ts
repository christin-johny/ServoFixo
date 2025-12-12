import { Router } from 'express';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { makeCustomerAuthMiddleware } from '../../middlewares/customerAuth.middleware';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';

// --- Import Sub-Routers ---
import authRoutes from './auth.routes';       // ✅ Import Auth
import serviceRoutes from './service.routes'; // ✅ Import Services
import categoryRoutes from './category.routes';
import customerRoutes from './customer.routes'
const router = Router();

const jwtService = new JwtService();
const customerAuth = makeCustomerAuthMiddleware(jwtService);


router.use('/auth', authRoutes);

router.use('/services', serviceRoutes);

router.use('/categories', categoryRoutes);

router.use('/profile',customerAuth,customerRoutes)

export default router;