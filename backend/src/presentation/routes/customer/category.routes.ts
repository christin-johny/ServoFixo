import { Router } from 'express';
import { customerCategoryController } from '../../../infrastructure/di/Container';

const router = Router();

// GET /api/customer/categories
router.get('/', customerCategoryController.getAll);

export default router;