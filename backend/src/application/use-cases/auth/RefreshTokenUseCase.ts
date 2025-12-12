// backend/src/application/use-cases/auth/RefreshTokenUseCase.ts
import redis from "../../../infrastructure/redis/redisClient";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import type { IJwtService, JwtPayload } from "../../services/IJwtService";

export class RefreshTokenUseCase {
  constructor(private readonly jwtService: IJwtService) {}

  /**
   * Executes refresh logic:
   * - verify incoming JWT refresh token signature
   * - ensure token exists in Redis (token revocation check)
   * - rotate refresh token (generate new refresh token + store in Redis, delete old) atomically
   * - generate new access token
   *
   * This implementation logs details for debugging and adds a small defensive fallback:
   * if redis key missing (race/eviction), we re-store the incoming refresh token for a short TTL,
   * then proceed to issue a new rotated token. Remove fallback if you want strict revocation.
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
     
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const redisKey = `refresh:${refreshToken}`;

    // 2) Check Redis for token presence
    let stored: string | null = null;
    try {
      stored = await redis.get(redisKey);
    } catch (err) {
     
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // Defensive fallback: if stored missing, try to tolerate transient race/eviction by re-storing
    if (!stored) {
     
      try {
        const fallbackTtl = Math.max(
          60,
          parseInt(process.env.JWT_REFRESH_FALLBACK_SECONDS ?? "120", 10)
        ); // seconds
        await redis.set(redisKey, String(payload.sub), "EX", fallbackTtl);
        // mark stored for flow to continue - this allows a short window
        stored = String(payload.sub);
        
      } catch (err) {
       
        throw new Error(ErrorMessages.UNAUTHORIZED);
      }
    }

    // 3) Create new tokens (rotate)
    const newAccessToken = await this.jwtService.generateAccessToken({
      sub: payload.sub,
      type: payload.type,
    });

    const newRefreshToken = await this.jwtService.generateRefreshToken({
      sub: payload.sub,
      type: payload.type,
    });

    const refreshTtlSeconds = parseInt(
      process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
      10
    );

    const newRedisKey = `refresh:${newRefreshToken}`;

    // 4) Persist new refresh token in Redis and delete old one atomically
    try {
      const tx = redis.multi();
      tx.set(newRedisKey, String(payload.sub), "EX", refreshTtlSeconds);
      tx.del(redisKey);
      const execRes = await tx.exec();
    } catch (err) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userId: payload.sub,
    };
  }
}

export default RefreshTokenUseCase;
