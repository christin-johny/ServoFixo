import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

const redis = new Redis(redisUrl, {
  connectTimeout: 5000,          // If no connection in 5s, move on
  maxRetriesPerRequest: 1,       // Don't let requests stack up
  retryStrategy(times) {
    if (times > 3) return null;  // Stop retrying after 3 fails
    return Math.min(times * 100, 2000);
  },
});

redis.on("connect", () => console.log("✅ Redis Connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err.message));

export default redis;