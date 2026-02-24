import { IOtpSessionRepository } from "../../domain/repositories/IOtpSessionRepository";
import { OtpSession } from "../../domain/entities/OtpSession";
import { OtpContext } from "../../domain/enums/OtpContext";
import { ICacheService } from "../../application/interfaces/services/ICacheService";

export class RedisOtpSessionRepository implements IOtpSessionRepository {
  constructor(private readonly _cacheService: ICacheService) {}

  private generateKey(email: string, sessionId: string, context: OtpContext): string {
    const normalizedEmail = email.toLowerCase().trim();
    return `otp:${context}:${normalizedEmail}:${sessionId}`;
  }

  private generateRateLimitKey(email: string): string {
    return `ratelimit:otp:${email.toLowerCase().trim()}`;
  }
 
  async create(session: OtpSession): Promise<OtpSession> {
    const key = this.generateKey(
      session.getEmail(),
      session.getSessionId(),
      session.getContext()
    );
 
    const ttlSeconds = Math.max(
      0,
      Math.floor((session.getExpiresAt().getTime() - Date.now()) / 1000)
    );

    const data = JSON.stringify({
      email: session.getEmail(),
      otp: session.getOtp(),
      context: session.getContext(),
      sessionId: session.getSessionId(),
      used: session.isUsed(),
      createdAt: new Date().toISOString()
    });

    await this._cacheService.set(key, data, ttlSeconds);  
    const rateKey = this.generateRateLimitKey(session.getEmail());
    const current = await this._cacheService.get(rateKey);
    const count = current ? parseInt(current, 10) + 1 : 1;
     
    const windowMinutes = Number(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES) || 60;
    const rateLimitTtl = windowMinutes * 60; 

    await this._cacheService.set(rateKey, count.toString(), rateLimitTtl);  

    return session;  
  }

  async findValidSession(
    email: string,
    sessionId: string,
    context: OtpContext
  ): Promise<OtpSession | null> { 
    const key = this.generateKey(email, sessionId, context);
    const data = await this._cacheService.get(key);

    if (!data) return null;

    const parsed = JSON.parse(data);
    
    if (parsed.used) return null;

    return new OtpSession(
      "", 
      parsed.email,
      parsed.otp,
      parsed.context,
      parsed.sessionId,
      new Date(),
      parsed.used,
      new Date(parsed.createdAt)
    );
  }

  async save(session: OtpSession): Promise<OtpSession> {
    const key = this.generateKey(
      session.getEmail(),
      session.getSessionId(),
      session.getContext()
    );

    if (session.isUsed()) {
      await this._cacheService.del(key);
    } else {
      await this.create(session);
    }
    return session;
  } 
  async countRecentSessions(email: string): Promise<number> { 
    const rateKey = this.generateRateLimitKey(email);
    const count = await this._cacheService.get(rateKey);
    return count ? parseInt(count, 10) : 0;
  }
}