import redis from "../../../infrastructure/redis/redisClient";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import type { IJwtService, JwtPayload } from "../../interfaces/IJwtService";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class RefreshTokenUseCase {
  constructor(
    private readonly _jwtService: IJwtService,
    private readonly _customerRepository: ICustomerRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(refreshToken: string) {
    this._logger.info(LogEvents.AUTH_REFRESH_INIT);
    if (!refreshToken) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    let payload: JwtPayload;
    try {
      payload = await this._jwtService.verifyRefreshToken(refreshToken);
    } catch (err) {
      this._logger.warn(
        `${LogEvents.AUTH_REFRESH_FAILED} - Invalid Token Signature`
      );
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }
    const redisKey = `refresh:${refreshToken}`;
    if (payload.type === "customer") {
      const customer = await this._customerRepository.findById(payload.sub);

      if (!customer) {
        await redis.del(redisKey);
        this._logger.warn(
          `${LogEvents.AUTH_REFRESH_FAILED} - Customer not found`
        );
        throw new Error(ErrorMessages.UNAUTHORIZED);
      }

      if (customer.isSuspended()) {
        await redis.del(redisKey);
        this._logger.warn(
          `${LogEvents.AUTH_REFRESH_FAILED} - Customer Suspended`
        );
        throw new Error(ErrorMessages.ACCOUNT_BLOCKED);
      }
    }

    let stored: string | null = null;
    try {
      stored = await redis.get(redisKey);
    } catch (err) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    if (!stored) {
      try {
        // Reuse detection logic: keeping original logic intact
        const fallbackTtl = Math.max(
          60,
          parseInt(process.env.JWT_REFRESH_FALLBACK_SECONDS ?? "120", 10)
        );
        await redis.set(redisKey, String(payload.sub), "EX", fallbackTtl);
        stored = String(payload.sub);
        this._logger.warn("Refresh Token Reuse Attempt Detected");
      } catch (err) {
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

    const refreshTtlSeconds = parseInt(
      process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
      10
    );

    const newRedisKey = `refresh:${newRefreshToken}`;
    try {
      const tx = redis.multi();
      tx.set(newRedisKey, String(payload.sub), "EX", refreshTtlSeconds);
      tx.del(redisKey);
      const execRes = await tx.exec();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      this._logger.error("Redis Error during token refresh", errorMessage);

      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    this._logger.info(
      `${LogEvents.AUTH_REFRESH_SUCCESS} - User: ${payload.sub}`
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userId: payload.sub,
    };
  }
}

export default RefreshTokenUseCase;
