
import { OtpContext } from '../../../../shared/types/enums/OtpContext';

export class OtpSession {
  private readonly id: string;
  private readonly email: string;
  private readonly otp: string;
  private readonly context: OtpContext;
  private readonly sessionId: string;
  private readonly expiresAt: Date;
  private used: boolean;
  private readonly createdAt: Date;

  constructor(
    id: string,
    email: string,
    otp: string,
    context: OtpContext,
    sessionId: string,
    expiresAt: Date,
    used: boolean = false,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.email = email;
    this.otp = otp;
    this.context = context;
    this.sessionId = sessionId;
    this.expiresAt = expiresAt;
    this.used = used;
    this.createdAt = createdAt;
  }

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getOtp(): string {
    return this.otp;
  }

  getContext(): OtpContext {
    return this.context;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  isUsed(): boolean {
    return this.used;
  }

  markAsUsed(): void {
    this.used = true;
  }
}
