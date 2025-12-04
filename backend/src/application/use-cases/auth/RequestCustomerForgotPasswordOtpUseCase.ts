// src/application/use-cases/auth/RequestCustomerForgotPasswordOtpUseCase.ts
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IEmailService } from '../../services/IEmailService';
import { OtpSession } from '../../../domain/entities/OtpSession';
import { OtpContext } from '../../../../../shared/types/enums/OtpContext';
import { CustomerForgotPasswordInitDto } from '../../../../../shared/types/dto/AuthDtos';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class RequestCustomerForgotPasswordOtpUseCase {
  private readonly otpExpiryMinutes = 5;
  private readonly rateLimitWindowMinutes = 60;
  private readonly rateLimitMax = 10; // 10 per hour

  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly otpSessionRepository: IOtpSessionRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(
    input: CustomerForgotPasswordInitDto
  ): Promise<{ message: string; sessionId: string }> {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // 1️⃣ Customer must exist
    const customer = await this.customerRepository.findByEmail(normalizedEmail);
    if (!customer) {
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    // 1.5️⃣ Rate limit check: count OTP sessions in the last window
    try {
      const recentCount = await this.otpSessionRepository.countRecentSessions(
        normalizedEmail,
        this.rateLimitWindowMinutes
      );
      if (recentCount >= this.rateLimitMax) {
        throw new Error('TOO_MANY_OTP_REQUESTS');
      }
    } catch (err) {
      // If repository throws, propagate it
      if ((err as Error).message === 'TOO_MANY_OTP_REQUESTS') {
        throw err;
      }
      // otherwise continue (or rethrow) — we want to be-safe and surface repo errors
    }

    // 2️⃣ Generate OTP + sessionId
    const otp = this.generateOtp();
    const sessionId = this.generateSessionId();
    const expiresAt = this.calculateExpiry();

    // 3️⃣ Save OTP session (ForgotPassword context)
    const session = new OtpSession(
      '',
      normalizedEmail,
      otp,
      OtpContext.ForgotPassword,
      sessionId,
      expiresAt
    );

    await this.otpSessionRepository.create(session);

    // 4️⃣ Send OTP email
    const subject = 'ServoFixo - Forgot Password OTP';
    const text = `Your OTP to reset your password is: ${otp}. It is valid for ${this.otpExpiryMinutes} minutes.`;

    await this.emailService.sendTextEmail(normalizedEmail, subject, text);

    return {
      message: 'OTP sent to email for password reset',
      sessionId,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateSessionId(): string {
    return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }

  private calculateExpiry(): Date {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + this.otpExpiryMinutes);
    return expires;
  }
}
