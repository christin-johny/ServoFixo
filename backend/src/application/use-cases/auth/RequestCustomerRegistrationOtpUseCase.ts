import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IOtpSessionRepository } from "../../../domain/repositories/IOtpSessionRepository";
import { IEmailService } from "../../interfaces/IEmailService";
import { CustomerRegisterInitDto } from "../../dto/auth/AuthDtos";
import { OtpContext } from "../../../domain/enums/OtpContext";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { OtpSession } from "../../../domain/entities/OtpSession";
import { ILogger } from "../../interfaces/ILogger"; 

export class RequestCustomerRegistrationOtpUseCase {
  private readonly _otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 2;

  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _emailService: IEmailService,
    private readonly _logger: ILogger
  ) {}

  async execute(
    input: CustomerRegisterInitDto
  ): Promise<{ message: string; sessionId: string }> {
    const { email,phone } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await this._customerRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }
    const existingPhone = await this._customerRepository.findByPhone(phone);
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

    await this._otpSessionRepository.create(session);

    const subject = "ServoFixo - Verify your email";
    const text = `Your registration OTP is: ${otp}. It is valid for ${this._otpExpiryMinutes} minutes.`;

    await this._emailService.sendTextEmail(normalizedEmail, subject, text);

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
    expires.setMinutes(expires.getMinutes() + this._otpExpiryMinutes);
    return expires;
  }
}