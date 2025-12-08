import { Router } from 'express';
import { adminCategoryController } from '../../infrastructure/di/Container';
import { upload } from '../../infrastructure/middleware/uploadMiddleware';

const router = Router();

// Base path: /api/admin/categories (Defined in admin.routes.ts)

// 1. Create (POST /)
router.post(
  '/', 
  upload.single('image'), // Middleware to handle S3 upload
  adminCategoryController.create
);

// 2. Get All (GET /)
router.get('/', adminCategoryController.getAll);

// 3. Update (PUT /:id)
router.put(
  '/:id', 
  upload.single('image'), 
  adminCategoryController.update
);

// 4. Delete (DELETE /:id)
router.delete('/:id', adminCategoryController.delete);

export default router;