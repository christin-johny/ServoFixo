import { Router } from 'express';
import { AdminAuthController } from '../controllers/AdminAuthController';

// Infrastructure
import { AdminMongoRepository } from '../../infrastructure/database/repositories/AdminMongoRepository';
import { BcryptPasswordHasher } from '../../infrastructure/security/BcryptPasswordHasher';
import { JwtService } from '../../infrastructure/security/JwtService';

// Use cases
import { AdminLoginUseCase } from '../../application/use-cases/auth/AdminLoginUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';

// Controllers
import { AuthTokenController } from '../controllers/AuthTokenController';

const router = Router();

// 🔧 Dependencies
const adminRepository = new AdminMongoRepository();
const passwordHasher = new BcryptPasswordHasher(10);
const jwtService = new JwtService();

// Use cases
const adminLoginUseCase = new AdminLoginUseCase(
  adminRepository,
  passwordHasher,
  jwtService
);

const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);

// Controllers
const adminAuthController = new AdminAuthController(adminLoginUseCase);
const authTokenController = new AuthTokenController(refreshTokenUseCase);

// Routes
router.post('/login', adminAuthController.login);
router.post('/refresh', authTokenController.refresh);

export default router;
