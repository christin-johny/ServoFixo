// backend/src/application/use-cases/auth/AdminLoginUseCase.ts

import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { IJwtService, JwtPayload } from '../../services/IJwtService';
import { AdminLoginDto } from '../../../../../shared/types/dto/AuthDtos';
import { AuthResultDto } from '../../dto/auth/AuthResultDto';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

// Redis client
import redis from '../../../infrastructure/redis/redisClient';

export class AdminLoginUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(input: AdminLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;

    // 1) Find admin by email
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    // 2) Compare passwords
    const passwordMatches = await this.passwordHasher.compare(
      password,
      admin.getPassword()
    );

    if (!passwordMatches) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    // 3) Build JWT payload
    const payload: JwtPayload = {
      sub: admin.getId(),
      roles: admin.getRoles(),
      type: 'admin',
    };

    // 4) Generate tokens
    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    // 5) Persist refresh token to Redis (so RefreshTokenUseCase can verify presence)
    // Use same TTL as your refresh flow expects (seconds). Default to 7 days.
    const refreshTtlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);

    try {
      const redisKey = `refresh:${refreshToken}`;
      await redis.set(redisKey, String(admin.getId()), 'EX', refreshTtlSeconds);
     
    } catch (err) {
      // Do NOT fail login if Redis is down — log and continue.
      console.error(err);
    }

    // 6) Return DTO (controller will set cookie)
    return {
      accessToken,
      refreshToken,
    };
  }
}
