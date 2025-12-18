import { Router } from 'express';
import { customerProfileController} from '../../../infrastructure/di/Container';

const router = Router();

router.get('/', customerProfileController.getProfile);
router.put('/', customerProfileController.updateProfile);
router.delete('/', customerProfileController.deleteAccount);

export default router;