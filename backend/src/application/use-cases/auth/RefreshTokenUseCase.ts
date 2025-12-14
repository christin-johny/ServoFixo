
import redis from "../../../infrastructure/redis/redisClient";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import type { IJwtService, JwtPayload } from "../../services/IJwtService";

export class RefreshTokenUseCase {
  constructor(private readonly jwtService: IJwtService) {}


  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyRefreshToken(refreshToken);
    } catch (err) {
     
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const redisKey = `refresh:${refreshToken}`;

    let stored: string | null = null;
    try {
      stored = await redis.get(redisKey);
    } catch (err) {
     
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    if (!stored) {
     
      try {
        const fallbackTtl = Math.max(
          60,
          parseInt(process.env.JWT_REFRESH_FALLBACK_SECONDS ?? "120", 10)
        ); 
        await redis.set(redisKey, String(payload.sub), "EX", fallbackTtl);
        stored = String(payload.sub);
        
      } catch (err) {
       
        throw new Error(ErrorMessages.UNAUTHORIZED);
      }
    }

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
