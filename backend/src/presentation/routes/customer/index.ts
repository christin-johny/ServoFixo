import { Router } from 'express';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { makeCustomerAuthMiddleware } from '../../middlewares/customerAuth.middleware';
import { StatusCodes } from '../../utils/StatusCodes';
 
import authRoutes from './auth.routes';        
import serviceRoutes from './service.routes'; 
import categoryRoutes from './category.routes';
import customerRoutes from './customer.routes';
import addressRoutes from'./adress.routes';
import zoneRoutes from'./zone.routes'
const router = Router();

const jwtService = new JwtService();
const customerAuth = makeCustomerAuthMiddleware(jwtService);


router.use('/auth', authRoutes);

router.use('/services', serviceRoutes);

router.use('/categories', categoryRoutes);

router.use("/zones",zoneRoutes);

router.use('/profile',customerAuth,customerRoutes)

router.use("/addresses",customerAuth,addressRoutes);



export default router;