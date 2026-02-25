import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IEmailService } from '../../interfaces/services/IEmailService';
import { OtpContext } from '../../../domain/enums/OtpContext';
import { OtpLoginInitDto, AuthResponse } from '../../dto/auth/AuthDtos';
import { ErrorMessages } from '../../constants/ErrorMessages';
import { OtpSession } from '../../../domain/entities/OtpSession'; 
import { IRequestCustomerEmailOtpUseCase } from '../../interfaces/use-cases/auth/IAuthUseCases';

export class RequestCustomerEmailOtpUseCase implements IRequestCustomerEmailOtpUseCase{
  private readonly _otpExpiryMinutes= Number(process.env.OTP_EXPIRY_MINUTES) || 5;

  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _emailService: IEmailService
  ) {}

  async execute(input: OtpLoginInitDto): Promise<AuthResponse> {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const customer = await this._customerRepository.findByEmail(normalizedEmail);
    if (!customer) { 
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    const otp = this.generateOtp();
    const sessionId = this.generateSessionId();
    const expiresAt = this.calculateExpiry();

    const session = new OtpSession(
      '', 
      normalizedEmail,
      otp,
      OtpContext.Login,
      sessionId,
      expiresAt
    );

    await this._otpSessionRepository.create(session);

    const subject = 'Your ServoFixo login OTP';
    const text = `Your OTP for login is: ${otp}. It is valid for ${this._otpExpiryMinutes} minutes.`;

    await this._emailService.sendTextEmail(normalizedEmail, subject, text);

    return {
      message: 'OTP sent to email',
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