import { Router } from 'express';
import { customerServiceController } from '../../../infrastructure/di/Container';

const router = Router();

router.get('/popular', customerServiceController.getMostBooked);
router.get('/', customerServiceController.getAll);
router.get('/:id', customerServiceController.getById);
export default router;