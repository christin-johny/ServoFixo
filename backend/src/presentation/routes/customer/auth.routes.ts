import { Router } from 'express';
import passport from '../../../infrastructure/security/PassportConfig';

// ✅ Import fully assembled controllers from Container
import { 
  customerAuthController, 
  authTokenController 
} from '../../../infrastructure/di/Container';

const router = Router();

// --- Auth Routes ---
router.post('/register/init-otp', customerAuthController.registerInitOtp);
router.post('/register/verify-otp', customerAuthController.registerVerifyOtp);
router.post('/login', customerAuthController.login);
router.post('/forgot-password/init-otp', customerAuthController.forgotPasswordInitOtp);
router.post('/forgot-password/verify-otp', customerAuthController.forgotPasswordVerifyOtp);
router.post('/google-login', customerAuthController.googleLogin);

// --- Token Management ---
router.post('/refresh', authTokenController.refresh);
router.post("/logout", customerAuthController.logout);

// --- Google OAuth (Passport) ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  customerAuthController.googleLoginCallback
);

export default router;