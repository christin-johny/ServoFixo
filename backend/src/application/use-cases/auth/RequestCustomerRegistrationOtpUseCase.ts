import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IEmailService } from '../../services/IEmailService';
import { CustomerRegisterInitDto } from '../../../../../shared/types/dto/AuthDtos';
import { OtpContext } from '../../../../../shared/types/enums/OtpContext';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';
import { OtpSession } from '../../../domain/entities/OtpSession';

export class RequestCustomerRegistrationOtpUseCase {
  private readonly otpExpiryMinutes = 5;

  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly otpSessionRepository: IOtpSessionRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(input: CustomerRegisterInitDto): Promise<{ message: string; sessionId: string }> {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // 1️⃣ Email must NOT be already registered
    const existing = await this.customerRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }

    // 2️⃣ Generate OTP + sessionId
    const otp = this.generateOtp();
    const sessionId = this.generateSessionId();
    const expiresAt = this.calculateExpiry();

    // 3️⃣ Save OTP session with context: Registration
    const session = new OtpSession(
      '', // Mongo will assign
      normalizedEmail,
      otp,
      OtpContext.Registration,
      sessionId,
      expiresAt
    );

    await this.otpSessionRepository.create(session);

    // 4️⃣ Send OTP
    const subject = 'ServoFixo - Verify your email';
    const text = `Your registration OTP is: ${otp}. It is valid for ${this.otpExpiryMinutes} minutes.`;

    await this.emailService.sendTextEmail(normalizedEmail, subject, text);

    return {
      message: 'OTP sent to email for registration',
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
