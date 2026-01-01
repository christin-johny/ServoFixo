import { Router } from 'express';
import { customerZoneController } from '../../../infrastructure/di/Container';

const router = Router();

router.get('/find-by-location', customerZoneController.findByLocation.bind(customerZoneController));

export default router;