import { Router } from 'express';
import { 
  adminAuthController, 
  authTokenController 
} from '../../../infrastructure/di/Container'; 

const router = Router();

router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);

export default router;