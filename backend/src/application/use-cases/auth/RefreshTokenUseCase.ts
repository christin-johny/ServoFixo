// server/application/use-cases/auth/RefreshTokenUseCase.ts
import redis from "../../../infrastructure/redis/redisClient";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import type { IJwtService, JwtPayload } from "../../services/IJwtService"; // adjust path if different

export class RefreshTokenUseCase {
  constructor(private readonly jwtService: IJwtService) {}

  /**
   * Executes refresh logic:
   * - verify incoming JWT refresh token signature
   * - ensure token exists in Redis (token revocation check)
   * - rotate refresh token (generate new refresh token + store in Redis, delete old)
   * - generate new access token
   */
  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 1) Verify the refresh JWT token signature and get payload
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyRefreshToken(refreshToken);
    } catch (err) {
      // invalid signature or expired
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 2) Check Redis for token presence
    const redisKey = `refresh:${refreshToken}`;
    const stored = await redis.get(redisKey);
    if (!stored) {
      // Token does not exist (revoked or never created)
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 3) Create new tokens (rotate)
    const newAccessToken = await this.jwtService.generateAccessToken({
      sub: payload.sub,
      roles: payload.roles,
      type: payload.type,
    });

    const newRefreshToken = await this.jwtService.generateRefreshToken({
      sub: payload.sub,
      roles: payload.roles,
      type: payload.type,
    });

    // compute TTL for refresh from env (seconds). If not set, default 7 days.
    const refreshTtlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);

    const newRedisKey = `refresh:${newRefreshToken}`;

    // 4) Persist new refresh token in Redis and delete old one (rotation)
    await redis.set(newRedisKey, String(payload.sub), "EX", refreshTtlSeconds);
    await redis.del(redisKey);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userId: payload.sub,
    };
  }
}

export default RefreshTokenUseCase;
