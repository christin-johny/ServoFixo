import { Router } from 'express';
import { customerServiceController } from '../../../infrastructure/di/Container';

const router = Router();

router.get('/popular', customerServiceController.getMostBooked.bind(customerServiceController));
router.get('/', customerServiceController.getAll.bind(customerServiceController));
router.get('/:id', customerServiceController.getById.bind(customerServiceController));

export default router;