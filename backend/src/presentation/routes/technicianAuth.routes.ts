// backend/src/presentation/routes/technicianAuth.routes.ts

import { Router } from 'express';
import { JwtService } from '../../infrastructure/security/JwtService';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { AuthTokenController } from '../controllers/AuthTokenController';

const router = Router();

// Dependencies
const jwtService = new JwtService();

// Use cases
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);

// Controllers
const authTokenController = new AuthTokenController(refreshTokenUseCase);

/**
 * Technician Authentication Routes
 * 
 * NOTE: Full technician login/register implementation pending.
 * Currently providing refresh token endpoint for consistency.
 */

// Refresh token endpoint (shared functionality)
router.post('/refresh', authTokenController.refresh);

// Placeholder routes for future implementation
router.post('/login', (req, res) => {
  res.status(501).json({
    error: 'Technician login not yet implemented',
  });
});

router.post('/register', (req, res) => {
  res.status(501).json({
    error: 'Technician registration not yet implemented',
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.status(200).json({
    message: 'Logged out successfully',
  });
});

export default router;
