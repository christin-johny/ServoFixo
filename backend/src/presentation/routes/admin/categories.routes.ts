import { Router } from 'express';
import { adminCategoryController } from '../../../infrastructure/di/Container';
import { upload } from '../../../infrastructure/middleware/uploadMiddleware';

const router = Router();

router.post(
  '/', 
  upload.single('image'), 
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