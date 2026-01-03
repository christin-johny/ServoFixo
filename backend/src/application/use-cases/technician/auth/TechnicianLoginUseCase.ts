import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IPasswordHasher } from "../../../interfaces/IPasswordHasher";
import { IJwtService, JwtPayload } from "../../../interfaces/IJwtService";
import { AuthResultDto } from "../../../dto/auth/AuthResultDto";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { ICacheService } from "../../../interfaces/ICacheService";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";

export interface TechnicianLoginDto {
  email: string;
  password: string;
}

export class TechnicianLoginUseCase {
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _jwtService: IJwtService,
    private readonly _cacheService: ICacheService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: TechnicianLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    this._logger.info(
      `${LogEvents.AUTH_LOGIN_INIT} (Technician) - Email: ${normalizedEmail}`
    );

    const technician = await this._technicianRepository.findByEmail(normalizedEmail);
    if (!technician) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} - Technician Not Found: ${normalizedEmail}`
      );
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    if (technician.getIsSuspended()) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} - Technician Suspended: ${normalizedEmail}`
      );
      throw new Error(ErrorMessages.ACCOUNT_BLOCKED);
    }

    // ✅ FIX: Handle 'string | undefined' type from getPassword()
    const storedPassword = technician.getPassword();
    if (!storedPassword) {
       this._logger.error("Technician has no password set");
       throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this._passwordHasher.compare(
      password,
      storedPassword
    );

    if (!isPasswordValid) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} - Invalid Password: ${normalizedEmail}`
      );
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    const payload: JwtPayload = {
      sub: technician.getId(),
      type: "technician",
    };

    const accessToken = await this._jwtService.generateAccessToken(payload);
    const refreshToken = await this._jwtService.generateRefreshToken(payload);

    const ttlSeconds = parseInt(
      process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
      10
    );

    try {
      await this._cacheService.set(
        `refresh:${refreshToken}`,
        String(technician.getId()),
        ttlSeconds
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(`${LogEvents.AUTH_REFRESH_FAILED} - Cache Error`, errorMessage);
    }

    this._logger.info(
      `${LogEvents.AUTH_LOGIN_SUCCESS} (Technician) - ID: ${technician.getId()}`
    );
 
    return {
      accessToken,
      refreshToken,
    };
  }
}