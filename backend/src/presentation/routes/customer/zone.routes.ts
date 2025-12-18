import { Router } from 'express';
import { CustomerzoneController } from '../../../infrastructure/di/Container';

const router = Router();
router.get('/find-by-location',CustomerzoneController.findByLocation)

export default router;