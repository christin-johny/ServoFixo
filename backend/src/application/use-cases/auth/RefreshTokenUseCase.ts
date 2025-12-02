// backend/src/application/use-cases/auth/RefreshTokenUseCase.ts

import { IJwtService, JwtPayload } from '../../services/IJwtService';
import { AuthResultDto } from '../../dto/auth/AuthResultDto';
import { RefreshTokenDto } from '../../../../../shared/types/dto/AuthDtos';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

/**
 * RefreshTokenUseCase
 *
 * Generic: works for admin, customer, technician.
 * - Takes a refresh token
 * - Verifies it
 * - Issues new access + refresh tokens using the same payload
 */
export class RefreshTokenUseCase {
  constructor(private readonly jwtService: IJwtService) {}

  async execute(input: RefreshTokenDto): Promise<AuthResultDto> {
    const { refreshToken } = input;

    if (!refreshToken) {
      throw new Error(ErrorMessages.MISSING_REQUIRED_FIELDS);
    }

    // 1️⃣ Verify refresh token and get payload (sub, roles, type)
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 2️⃣ Generate new tokens with same payload
    const accessToken = await this.jwtService.generateAccessToken(payload);
    const newRefreshToken = await this.jwtService.generateRefreshToken(payload);

    // 3️⃣ Return both tokens
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
