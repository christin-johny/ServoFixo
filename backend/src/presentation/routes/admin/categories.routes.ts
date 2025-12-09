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
  adminCategoryController.create
);

router.get('/', adminCategoryController.getAll);

router.put(
  '/:id', 
  upload.single('image'), 
  adminCategoryController.update
);

router.delete('/:id', adminCategoryController.delete);

export default router;