import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IOtpSessionRepository } from "../../../../domain/repositories/IOtpSessionRepository";
import { IEmailService } from "../../../interfaces/IEmailService";
import { TechnicianForgotPasswordInitDto } from "../../../dto/technician/TechnicianAuthDtos";
import { OtpContext } from "../../../../domain/enums/OtpContext";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { OtpSession } from "../../../../domain/entities/OtpSession";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";

export class RequestTechnicianForgotPasswordOtpUseCase {
  private readonly _otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 2;

  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _emailService: IEmailService,
    private readonly _logger: ILogger
  ) {}

  async execute(
    input: TechnicianForgotPasswordInitDto
  ): Promise<{ message: string; sessionId: string }> {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();
 
    const technician = await this._technicianRepository.findByEmail(normalizedEmail);
    if (!technician) {
      this._logger.warn(`${LogEvents.AUTH_FORGOT_PASS_INIT_FAILED} - Technician Not Found: ${normalizedEmail}`);
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }
 
    const otp = this.generateOtp();
    const sessionId = this.generateSessionId();
    const expiresAt = this.calculateExpiry();

    const session = new OtpSession(
      "",
      normalizedEmail,
      otp,
      OtpContext.ForgotPassword,  
      sessionId,
      expiresAt
    );
 
    await this._otpSessionRepository.create(session);
 
    const subject = "ServoFixo Partner - Reset Your Password";
    const text = `Your OTP to reset your password is: ${otp}. It is valid for ${this._otpExpiryMinutes} minutes.`;

    await this._emailService.sendTextEmail(normalizedEmail, subject, text);

    return {
      message: "OTP sent to email for password reset",
      sessionId,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateExpiry(): Date {
    return new Date(Date.now() + this._otpExpiryMinutes * 60 * 1000);
  }
}