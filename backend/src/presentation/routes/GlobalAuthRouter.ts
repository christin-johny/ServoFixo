import { Router } from 'express';
import { authTokenController } from '../../infrastructure/di/Container';

const router = Router();

router.post('/refresh', authTokenController.refresh);

export default router;