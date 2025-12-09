import { Router } from 'express';
import { AdminAuthController } from '../../controllers/Admin/AdminAuthController';

import { AdminMongoRepository } from '../../../infrastructure/database/repositories/AdminMongoRepository';
import { BcryptPasswordHasher } from '../../../infrastructure/security/BcryptPasswordHasher';
import { JwtService } from '../../../infrastructure/security/JwtService';

import { AdminLoginUseCase } from '../../../application/use-cases/auth/AdminLoginUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';

import { AuthTokenController } from '../../controllers/AuthTokenController';

const router = Router();

const adminRepository = new AdminMongoRepository();
const passwordHasher = new BcryptPasswordHasher(10);
const jwtService = new JwtService();

const adminLoginUseCase = new AdminLoginUseCase(
  adminRepository,
  passwordHasher,
  jwtService
);

const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);

const adminAuthController = new AdminAuthController(adminLoginUseCase);
const authTokenController = new AuthTokenController(refreshTokenUseCase);

router.post('/login', adminAuthController.login);
router.post('/refresh', authTokenController.refresh);
router.post('/logout', adminAuthController.logout);
export default router;
