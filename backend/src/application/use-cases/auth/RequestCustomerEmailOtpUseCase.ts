import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IEmailService } from '../../services/IEmailService';
import { OtpContext } from '../../../../../shared/types/enums/OtpContext';
import { OtpLoginInitDto, AuthResponse } from '../../../../../shared/types/dto/AuthDtos';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';
import { OtpSession } from '../../../domain/entities/OtpSession';

export class RequestCustomerEmailOtpUseCase {
  private readonly otpExpiryMinutes = 5;

  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly otpSessionRepository: IOtpSessionRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(input: OtpLoginInitDto): Promise<AuthResponse> {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const customer = await this.customerRepository.findByEmail(normalizedEmail);
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

    await this.otpSessionRepository.create(session);

    const subject = 'Your ServoFixo login OTP';
    const text = `Your OTP for login is: ${otp}. It is valid for ${this.otpExpiryMinutes} minutes.`;

    await this.emailService.sendTextEmail(normalizedEmail, subject, text);

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
    expires.setMinutes(expires.getMinutes() + this.otpExpiryMinutes);
    return expires;
  }
}
