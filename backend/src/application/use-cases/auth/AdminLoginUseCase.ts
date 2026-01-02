import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import { IPasswordHasher } from "../../interfaces/IPasswordHasher";
import { IJwtService, JwtPayload } from "../../interfaces/IJwtService";
import { AdminLoginDto } from "../../../../../shared/types/dto/AuthDtos";
import { AuthResultDto } from "../../dto/auth/AuthResultDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ICacheService } from "../../interfaces/ICacheService"; 
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class AdminLoginUseCase {
  constructor(
    private readonly _adminRepository: IAdminRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _jwtService: IJwtService,
    private readonly _cacheService: ICacheService,  
    private readonly _logger: ILogger
  ) {}

  async execute(input: AdminLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;
    this._logger.info(`${LogEvents.AUTH_LOGIN_INIT} (Admin) - Email: ${email}`);

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

    this._logger.info(
      `${LogEvents.AUTH_LOGIN_SUCCESS} (Admin) - ID: ${admin.getId()}`
    );
    return {
      accessToken,
      refreshToken,
    };
  }
}