import { Router } from 'express';
import { adminZoneController } from '../../../infrastructure/di/Container'; 
import { JwtService } from '../../../infrastructure/security/JwtService';
import { makeAdminAuthMiddleware } from '../../middlewares/adminAuth.middleware';

const router = Router();

const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

router.post('/', adminAuth, adminZoneController.create.bind(adminZoneController));
router.get('/', adminAuth, adminZoneController.getAll.bind(adminZoneController));
router.delete('/:id', adminAuth, adminZoneController.delete.bind(adminZoneController));
router.put('/:id', adminAuth, adminZoneController.update.bind(adminZoneController)); 

export default router;