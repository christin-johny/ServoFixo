import { Router } from 'express';
import { adminServiceItemController } from '../../../infrastructure/di/Container';
import { upload } from '../../../infrastructure/middleware/uploadMiddleware';

const router = Router();

// Base Path: /api/admin/services (will be configured in index.ts)

// 1. Create Service (POST /)
// Accepts: Multipart Form Data
// Fields: categoryId, name, description, basePrice, specifications (JSON string)
// Files: images (Max 5)
router.post(
  '/', 
  upload.array('images', 5), 
  adminServiceItemController.create
);

// 2. Get All Services (GET /)
// Params: ?page=1&limit=10&categoryId=XYZ&search=abc
router.get('/', adminServiceItemController.getAll);

// 3. Delete Service (DELETE /:id)
router.delete('/:id', adminServiceItemController.delete);

export default router;