import { Router } from 'express';
import passport from '../../../infrastructure/security/PassportConfig';
import { 
  customerAuthController 
} from '../../../infrastructure/di/Container';

const router = Router();

router.post('/register/init-otp', customerAuthController.registerInitOtp.bind(customerAuthController));
router.post('/register/verify-otp', customerAuthController.registerVerifyOtp.bind(customerAuthController));
router.post('/login', customerAuthController.login.bind(customerAuthController));
router.post('/forgot-password/init-otp', customerAuthController.forgotPasswordInitOtp.bind(customerAuthController));
router.post('/forgot-password/verify-otp', customerAuthController.forgotPasswordVerifyOtp.bind(customerAuthController));
router.post('/google-login', customerAuthController.googleLogin.bind(customerAuthController));

router.post("/logout", customerAuthController.logout.bind(customerAuthController));
 
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  customerAuthController.googleLoginCallback.bind(customerAuthController)
);

export default router;