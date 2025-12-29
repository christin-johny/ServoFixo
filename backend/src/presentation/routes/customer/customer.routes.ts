import { Router } from 'express';
import { customerProfileController} from '../../../infrastructure/di/Container';
import { upload } from '../../../infrastructure/middleware/uploadMiddleware';
const router = Router();

router.get('/', customerProfileController.getProfile);
router.put('/', customerProfileController.updateProfile);
router.delete('/', customerProfileController.deleteAccount);

router.post('/avatar', upload.single('avatar'), customerProfileController.uploadAvatar);
router.patch('/change-password', customerProfileController.changePassword);
export default router;