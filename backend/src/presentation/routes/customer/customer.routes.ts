import { Router } from 'express';
import { customerProfileController } from '../../../infrastructure/di/Container';
import { upload } from '../../../infrastructure/middleware/uploadMiddleware';

const router = Router();

router.get('/', customerProfileController.getProfile.bind(customerProfileController));
router.put('/', customerProfileController.updateProfile.bind(customerProfileController));
router.delete('/', customerProfileController.deleteAccount.bind(customerProfileController));

router.post('/avatar', upload.single('avatar'), customerProfileController.uploadAvatar.bind(customerProfileController));
router.patch('/change-password', customerProfileController.changePassword.bind(customerProfileController));

export default router;