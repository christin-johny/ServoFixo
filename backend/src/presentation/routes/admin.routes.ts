import { Router } from 'express';
import { JwtService } from '../../infrastructure/security/JwtService';
import { makeAdminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

// Import sub-routers
import adminAuthRoutes from './adminAuth.routes';
import adminZonesRoutes from './admin.zones.routes';
import adminCategoryRoutes from './admin.categories.routes'; 

const router = Router();

// Middleware Setup
const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

// ==========================================
// 1. PUBLIC ROUTES (No Auth Required)
// ==========================================
// Mounts to: /api/admin/auth/login, /refresh, etc.
router.use('/auth', adminAuthRoutes);


// ==========================================
// 2. PROTECTED ROUTES (Require Admin Token)
// ==========================================

// Dashboard
router.get('/dashboard', adminAuth, (req, res) => {
  const user = (req as any).user;
  return res.status(StatusCodes.OK).json({
    message: 'Admin dashboard data',
    user,
  });
});

// Zones Module
// Mounts to: /api/admin/zones
router.use('/zones', adminZonesRoutes); 
// Note: We removed 'adminAuth' from here because your admin.zones.routes.ts 
// ALREADY applies the middleware to each specific route. 
// If you want to apply it globally to all zone routes, pass it here:
// router.use('/zones', adminAuth, adminZonesRoutes);

// Service Categories Module
// Mounts to: /api/admin/categories
router.use('/categories', adminCategoryRoutes); 
// Note: Your AdminRoutes.ts for categories (which we just wrote in the previous step)
// defined routes like '/categories' directly. So we mount it at root '/'.

export default router;