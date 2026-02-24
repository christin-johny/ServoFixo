import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import { IPasswordHasher } from "../../interfaces/services/IPasswordHasher";
import { IJwtService, JwtPayload } from "../../interfaces/services/IJwtService";
import { AdminLoginDto } from "../../dto/auth/AuthDtos";
import { AuthResultDto } from "../../dto/auth/AuthResultDto";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ICacheService } from "../../interfaces/services/ICacheService"; 
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents"; 
import { IAdminLoginUseCase } from "../../interfaces/use-cases/auth/IAuthUseCases";

export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(
    private readonly _adminRepository: IAdminRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _jwtService: IJwtService,
    private readonly _cacheService: ICacheService,  
    private readonly _logger: ILogger
  ) {}

  async execute(input: AdminLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;

    const admin = await this._adminRepository.findByEmail(email);

    if (!admin) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} (Admin) - User not found: ${email}`
      );
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    const passwordMatches = await this._passwordHasher.compare(
      password,
      admin.getPassword()
    );

    if (!passwordMatches) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} (Admin) - Invalid Password: ${email}`
      );
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    const payload: JwtPayload = {
      sub: admin.getId(),
      type: "admin",
    };

    const accessToken = await this._jwtService.generateAccessToken(payload);
    const refreshToken = await this._jwtService.generateRefreshToken(payload);

    const refreshTtlSeconds = parseInt(
      process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
      10
    );

    try { 
      const redisKey = `refresh:${refreshToken}`;
      await this._cacheService.set(redisKey, String(admin.getId()), refreshTtlSeconds);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error("Cache error during admin login", errorMessage);
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}