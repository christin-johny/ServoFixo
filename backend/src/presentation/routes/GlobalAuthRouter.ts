import { Router } from 'express';
import { AuthTokenController } from '../controllers/AuthTokenController';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { JwtService } from '../../infrastructure/security/JwtService';

const router = Router();

// Setup dependencies (same as you did before)
const jwtService = new JwtService();
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);
const authTokenController = new AuthTokenController(refreshTokenUseCase);

// 🟢 The Single Global Refresh Endpoint
router.post('/refresh', authTokenController.refresh);

export default router;