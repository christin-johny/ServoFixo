import { Redis } from "ioredis";
import { ICacheService } from "../../application/interfaces/ICacheService";

export class RedisCacheService implements ICacheService {
  constructor(private _redisClient: Redis) {}

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this._redisClient.set(key, value, "EX", ttlSeconds);
    } else {
      await this._redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this._redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this._redisClient.del(key);
  }
}