import { Router } from 'express';
import { adminServiceItemController } from '../../../infrastructure/di/Container';
import { upload } from '../../../infrastructure/middleware/uploadMiddleware';
import { validateRequest } from '../../../infrastructure/middleware/validateRequest';
import { createServiceItemSchema } from '../../validation/serviceSchemas';

const router = Router();

// 1. Create Service (POST /)
router.post(
  '/', 
  upload.array('images', 5), 
  validateRequest(createServiceItemSchema), 
  adminServiceItemController.create
);

// 2. Get All Services (GET /)
router.get('/', adminServiceItemController.getAll);

// ✅ 3. Update Service (PUT /:id) -- THIS WAS MISSING
router.put(
  '/:id',
  upload.array('images', 5), // Allow uploading NEW images during edit
  validateRequest(createServiceItemSchema), // Validate the text fields
  adminServiceItemController.update
);

// 4. Delete Service (DELETE /:id)
router.delete('/:id', adminServiceItemController.delete);

router.patch('/:id/toggle', (req, res) => adminServiceItemController.toggleStatus(req, res));

export default router;