//customerAuth.routes.ts


import { Router } from 'express';
import passport from '../../infrastructure/security/PassportConfig';

// Infra
import { CustomerMongoRepository } from '../../infrastructure/database/repositories/CustomerMongoRepository';
import { OtpSessionMongoRepository } from '../../infrastructure/database/repositories/OtpSessionMongoRepository';
import { NodemailerEmailService } from '../../infrastructure/email/NodemailerEmailService';
import { JwtService } from '../../infrastructure/security/JwtService';
import { BcryptPasswordHasher } from '../../infrastructure/security/BcryptPasswordHasher';

// Use cases
import { RequestCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/RequestCustomerRegistrationOtpUseCase';
import { VerifyCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/VerifyCustomerRegistrationOtpUseCase';
import { CustomerLoginUseCase } from '../../application/use-cases/auth/CustomerLoginUseCase';
import { RequestCustomerForgotPasswordOtpUseCase } from '../../application/use-cases/auth/RequestCustomerForgotPasswordOtpUseCase';
import { VerifyCustomerForgotPasswordOtpUseCase } from '../../application/use-cases/auth/VerifyCustomerForgotPasswordOtpUseCase';
import { CustomerGoogleLoginUseCase } from '../../application/use-cases/auth/CustomerGoogleLoginUseCase';

// Controller
import { CustomerAuthController } from '../controllers/CustomerAuthController';

//tokens
// add near other "Use cases" imports
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { AuthTokenController } from '../controllers/AuthTokenController';


const router = Router();

// Dependencies
const customerRepository = new CustomerMongoRepository();
const otpSessionRepository = new OtpSessionMongoRepository();
const emailService = new NodemailerEmailService();
const jwtService = new JwtService();
const passwordHasher = new BcryptPasswordHasher(10);

const requestRegisterOtpUseCase = new RequestCustomerRegistrationOtpUseCase(
  customerRepository,
  otpSessionRepository,
  emailService
);

const verifyRegisterOtpUseCase = new VerifyCustomerRegistrationOtpUseCase(
  customerRepository,
  otpSessionRepository,
  passwordHasher,
  jwtService
);

const customerLoginUseCase = new CustomerLoginUseCase(
  customerRepository,
  passwordHasher,
  jwtService
);

const requestForgotPasswordOtpUseCase = new RequestCustomerForgotPasswordOtpUseCase(
  customerRepository,
  otpSessionRepository,
  emailService
);

const verifyForgotPasswordOtpUseCase = new VerifyCustomerForgotPasswordOtpUseCase(
  customerRepository,
  otpSessionRepository,
  passwordHasher
);

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID is not set in environment variables");
}

const customerGoogleLoginUseCase = new CustomerGoogleLoginUseCase(
  customerRepository,
  jwtService,
  googleClientId   
);


const customerAuthController = new CustomerAuthController(
  requestRegisterOtpUseCase,
  verifyRegisterOtpUseCase,
  customerLoginUseCase,
  requestForgotPasswordOtpUseCase,
  verifyForgotPasswordOtpUseCase,
  customerGoogleLoginUseCase
);


const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);
const authTokenController = new AuthTokenController(refreshTokenUseCase);

// Routes
router.post('/register/init-otp', customerAuthController.registerInitOtp);
router.post('/register/verify-otp', customerAuthController.registerVerifyOtp);
router.post('/login', customerAuthController.login);
router.post('/forgot-password/init-otp', customerAuthController.forgotPasswordInitOtp);
router.post('/forgot-password/verify-otp', customerAuthController.forgotPasswordVerifyOtp);
router.post('/google-login', customerAuthController.googleLogin);

//refresh
router.post('/refresh', authTokenController.refresh);

// Passport Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  customerAuthController.googleLoginCallback
);
//logout

// after other routes
router.post("/logout", customerAuthController.logout);



export default router;
