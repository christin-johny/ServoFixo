import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import type { IJwtService, JwtPayload } from "../../interfaces/IJwtService";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";  
import { ICacheService } from "../../interfaces/ICacheService";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class RefreshTokenUseCase {
  constructor(
    private readonly _jwtService: IJwtService,
    private readonly _customerRepository: ICustomerRepository, 
    private readonly _cacheService: ICacheService,
    private readonly _technicianRepository:ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    let payload: JwtPayload;
    try {
      payload = await this._jwtService.verifyRefreshToken(refreshToken);
    } catch   {
      this._logger.warn(`${LogEvents.AUTH_REFRESH_FAILED} - Invalid Token Signature`);
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const redisKey = `refresh:${refreshToken}`;
 
    if (payload.type === "customer") {
      const customer = await this._customerRepository.findById(payload.sub);
      if (!customer) {
        await this._cacheService.del(redisKey);
        throw new Error(ErrorMessages.UNAUTHORIZED);
      }
      if (customer.isSuspended()) {
        throw new Error(ErrorMessages.ACCOUNT_BLOCKED);
      }
    }  
    else if (payload.type === "technician") {
      const tech = await this._technicianRepository.findById(payload.sub);
      if (!tech) {
        await this._cacheService.del(redisKey);
        throw new Error(ErrorMessages.UNAUTHORIZED);
      } 
      if (tech.getIsSuspended()) {
        throw new Error(ErrorMessages.ACCOUNT_BLOCKED);
      }
    } 
 
    let stored: string | null = null;
    try {
      stored = await this._cacheService.get(redisKey);
    } catch { throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    if (!stored) { 
      try {
        const fallbackTtl = Math.max(60, parseInt(process.env.JWT_REFRESH_FALLBACK_SECONDS ?? "120", 10));
        await this._cacheService.set(redisKey, String(payload.sub), fallbackTtl);
        stored = String(payload.sub);
        this._logger.warn("Refresh Token Reuse Attempt Detected");
      } catch   {
        throw new Error(ErrorMessages.UNAUTHORIZED);
      }
    }
 
    const newAccessToken = await this._jwtService.generateAccessToken({
      sub: payload.sub,
      type: payload.type,
    });

    const newRefreshToken = await this._jwtService.generateRefreshToken({
      sub: payload.sub,
      type: payload.type,
    });

    const refreshTtlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);
    const newRedisKey = `refresh:${newRefreshToken}`;

    try {
      await this._cacheService.set(newRedisKey, String(payload.sub), refreshTtlSeconds);
      await this._cacheService.del(redisKey);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error("Cache Error during token refresh", errorMessage);
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}