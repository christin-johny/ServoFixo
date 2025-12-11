import { Router } from 'express';
import { customerServiceController } from '../../../infrastructure/di/Container';

const router = Router();

router.get('/popular', customerServiceController.getMostBooked);

export default router;