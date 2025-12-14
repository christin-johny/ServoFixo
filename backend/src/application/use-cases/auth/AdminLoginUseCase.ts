import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { IJwtService, JwtPayload } from '../../services/IJwtService';
import { AdminLoginDto } from '../../../../../shared/types/dto/AuthDtos';
import { AuthResultDto } from '../../dto/auth/AuthResultDto';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';
import redis from '../../../infrastructure/redis/redisClient';

export class AdminLoginUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(input: AdminLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    const passwordMatches = await this.passwordHasher.compare(
      password,
      admin.getPassword()
    );

    if (!passwordMatches) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    const payload: JwtPayload = {
      sub: admin.getId(),
      type: 'admin',
    };

    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    const refreshTtlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);

    try {
      const redisKey = `refresh:${refreshToken}`;
      await redis.set(redisKey, String(admin.getId()), 'EX', refreshTtlSeconds);
     
    } catch (err) {
      console.error(err);
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
