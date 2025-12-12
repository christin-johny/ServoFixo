import { Router } from 'express';
import { customerProfileController} from '../../../infrastructure/di/Container';

const router = Router();

router.get('/', customerProfileController.getProfile);

export default router;