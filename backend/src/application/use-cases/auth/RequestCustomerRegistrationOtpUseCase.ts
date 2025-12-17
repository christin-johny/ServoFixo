import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IOtpSessionRepository } from "../../../domain/repositories/IOtpSessionRepository";
import { IEmailService } from "../../services/IEmailService";
import { CustomerRegisterInitDto } from "../../../../../shared/types/dto/AuthDtos";
import { OtpContext } from "../../../../../shared/types/enums/OtpContext";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { OtpSession } from "../../../domain/entities/OtpSession";

export class RequestCustomerRegistrationOtpUseCase {
  private readonly otpExpiryMinutes = 5;

  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly otpSessionRepository: IOtpSessionRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(
    input: CustomerRegisterInitDto
  ): Promise<{ message: string; sessionId: string }> {
    const { email,phone } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await this.customerRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }
    const existingPhone = await this.customerRepository.findByPhone(phone);
    if (existingPhone ) {
      throw new Error(ErrorMessages.PHONE_ALREADY_EXISTS );
    }

    const otp = this.generateOtp();
    const sessionId = this.generateSessionId();
    const expiresAt = this.calculateExpiry();
    const session = new OtpSession(
      "",
      normalizedEmail,
      otp,
      OtpContext.Registration,
      sessionId,
      expiresAt
    );

    await this.otpSessionRepository.create(session);

    const subject = "ServoFixo - Verify your email";
    const text = `Your registration OTP is: ${otp}. It is valid for ${this.otpExpiryMinutes} minutes.`;

    await this.emailService.sendTextEmail(normalizedEmail, subject, text);

    return {
      message: "OTP sent to email for registration",
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
