import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IPasswordHasher } from "../../interfaces/services/IPasswordHasher";
import { IJwtService, JwtPayload } from "../../interfaces/services/IJwtService";
import { AuthResultDto } from "../../dto/auth/AuthResultDto";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ICacheService } from "../../interfaces/services/ICacheService";  
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents"; 
import { CustomerLoginDto } from "../../dto/auth/CustomerLoginDto";
import { ICustomerLoginUseCase } from "../../interfaces/use-cases/auth/IAuthUseCases";

export class CustomerLoginUseCase implements ICustomerLoginUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _jwtService: IJwtService,
    private readonly _cacheService: ICacheService,  
    private readonly _logger: ILogger
  ) {}

  async execute(input: CustomerLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const customer = await this._customerRepository.findByEmail(
      normalizedEmail
    );
    if (!customer) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} - Customer not found: ${normalizedEmail}`
      );
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    if (customer.isSuspended()) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} - Account Blocked: ${normalizedEmail}`
      );
      throw new Error(ErrorMessages.ACCOUNT_BLOCKED);
    }

    const ok = await this._passwordHasher.compare(
      password,
      customer.getPassword()
    );
    if (!ok) {
      this._logger.warn(
        `${LogEvents.AUTH_LOGIN_FAILED} - Invalid Password: ${normalizedEmail}`
      );
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    const payload: JwtPayload = {
      sub: customer.getId(),
      type: "customer",
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
        String(customer.getId()),
        ttlSeconds
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error("Cache error during customer login", errorMessage);
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}