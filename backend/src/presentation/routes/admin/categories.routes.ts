import { Router } from 'express';
import { adminCategoryController } from '../../../infrastructure/di/Container';
import { upload } from '../../../infrastructure/middleware/uploadMiddleware';
import { createCategorySchema } from '../../validation/serviceSchemas';
import { validateRequest } from '../../../infrastructure/middleware/validateRequest';

const router = Router();

router.post(
  '/', 
  upload.single('image'), 
  validateRequest(createCategorySchema), 
  adminCategoryController.create.bind(adminCategoryController)
);

router.get('/', adminCategoryController.getAll.bind(adminCategoryController));

router.put(
  '/:id', 
  upload.single('image'), 
  adminCategoryController.update.bind(adminCategoryController)
);

router.delete('/:id', adminCategoryController.delete.bind(adminCategoryController));

router.patch('/:id/toggle', adminCategoryController.toggleStatus.bind(adminCategoryController));

export default router;