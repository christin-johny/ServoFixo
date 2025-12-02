// backend/src/application/use-cases/auth/AdminLoginUseCase.ts

import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { IJwtService, JwtPayload } from '../../services/IJwtService';
import { AdminLoginDto } from '../../../../../shared/types/dto/AuthDtos';
import { AuthResultDto } from '../../dto/auth/AuthResultDto';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

/**
 * AdminLoginUseCase
 *
 * Admin logs in using email & password → gets access + refresh tokens.
 */
export class AdminLoginUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(input: AdminLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;

    // 1️⃣ Find admin by email
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    // 2️⃣ Compare passwords
    const passwordMatches = await this.passwordHasher.compare(
      password,
      admin.getPassword()
    );

    if (!passwordMatches) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    // 3️⃣ Build JWT payload
    const payload: JwtPayload = {
      sub: admin.getId(),
      roles: admin.getRoles(),
      type: 'admin',
    };

    // 4️⃣ Generate tokens
    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    // 5️⃣ Return DTO
    return {
      accessToken,
      refreshToken,
    };
  }
}
