import { Router } from 'express';

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

// Controller
import { CustomerAuthController } from '../controllers/CustomerAuthController';

const router = Router();

// Dependencies
const customerRepository = new CustomerMongoRepository();
const otpSessionRepository = new OtpSessionMongoRepository();
const emailService = new NodemailerEmailService();
const jwtService = new JwtService();
const passwordHasher = new BcryptPasswordHasher(10);

// Use cases
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

// Controller
const customerAuthController = new CustomerAuthController(
  requestRegisterOtpUseCase,
  verifyRegisterOtpUseCase,
  customerLoginUseCase
);

// Routes
router.post('/register/init-otp', customerAuthController.registerInitOtp);
router.post('/register/verify-otp', customerAuthController.registerVerifyOtp);
router.post('/login', customerAuthController.login);

export default router;
