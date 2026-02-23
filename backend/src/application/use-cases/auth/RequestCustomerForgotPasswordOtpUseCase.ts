import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IEmailService } from '../../interfaces/IEmailService';
import { OtpSession } from '../../../domain/entities/OtpSession';
import { OtpContext } from '../../../domain/enums/OtpContext';
import { CustomerForgotPasswordInitDto } from '../../dto/auth/AuthDtos';
import { ErrorMessages } from '../../constants/ErrorMessages';
import { ILogger } from '../../interfaces/ILogger'; 

export class RequestCustomerForgotPasswordOtpUseCase {
  private readonly _otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 2;
  private readonly _rateLimitWindowMinutes = Number(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES) || 60;
  private readonly _rateLimitMax = Number(process.env.OTP_RATE_LIMIT_MAX) || 10;

  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _emailService: IEmailService,
    private readonly _logger: ILogger
  ) {}

  async execute(
    input: CustomerForgotPasswordInitDto
  ): Promise<{ message: string; sessionId: string }> {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const customer = await this._customerRepository.findByEmail(normalizedEmail);
    if (!customer) { 
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    try {
      const recentCount = await this._otpSessionRepository.countRecentSessions(
        normalizedEmail,
        this._rateLimitWindowMinutes
      );
      if (recentCount >= this._rateLimitMax) { 
        throw new Error(ErrorMessages.TOO_MANY_OTP_REQUESTS);
      }
    } catch (err) {
      if ((err as Error).message === ErrorMessages.TOO_MANY_OTP_REQUESTS) {
        throw err;
      }
    }

    const otp = this.generateOtp();
    const sessionId = this.generateSessionId();
    const expiresAt = this.calculateExpiry();

    const session = new OtpSession(
      '',
      normalizedEmail,
      otp,
      OtpContext.ForgotPassword,
      sessionId,
      expiresAt
    );

    await this._otpSessionRepository.create(session);

    const subject = 'ServoFixo - Forgot Password OTP';
    const text = `Your OTP to reset your password is: ${otp}. It is valid for ${this._otpExpiryMinutes} minutes.`;

    await this._emailService.sendTextEmail(normalizedEmail, subject, text);

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
    expires.setMinutes(expires.getMinutes() + this._otpExpiryMinutes);
    return expires;
  }
}