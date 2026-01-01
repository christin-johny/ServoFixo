import { Router } from 'express';
import { adminAuthController } from '../../../infrastructure/di/Container'; 

const router = Router();

router.post('/login', adminAuthController.login.bind(adminAuthController));
router.post('/logout', adminAuthController.logout.bind(adminAuthController));

export default router;