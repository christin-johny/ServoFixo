import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IOtpSessionRepository } from "../../../../domain/repositories/IOtpSessionRepository";
import { IEmailService } from "../../../interfaces/IEmailService";
import { TechnicianRegisterInitDto } from "../../../dto/technician/TechnicianAuthDtos";
import { OtpContext } from "../../../../../../shared/types/enums/OtpContext";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { OtpSession } from "../../../../domain/entities/OtpSession";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";

export class RequestTechnicianRegistrationOtpUseCase {
  private readonly _otpExpiryMinutes = 5; 

  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _emailService: IEmailService,
    private readonly _logger: ILogger
  ) {}

  async execute(
    input: TechnicianRegisterInitDto
  ): Promise<{ message: string; sessionId: string }> {
    const { email, phone } = input;
    const normalizedEmail = email.toLowerCase().trim();

    this._logger.info(`${LogEvents.AUTH_REGISTER_INIT} (Technician) - Email: ${normalizedEmail}`);
 
    const existingEmail = await this._technicianRepository.findByEmail(normalizedEmail);
    if (existingEmail) { 
      this._logger.warn(`${LogEvents.AUTH_REGISTER_FAILED_EMAIL_EXISTS}: ${normalizedEmail}`);
      throw new Error(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }
 
    const existingPhone = await this._technicianRepository.findByPhone(phone);
    if (existingPhone) { 
      this._logger.warn(`${LogEvents.AUTH_REGISTER_FAILED_PHONE_EXISTS}: ${phone}`);
      throw new Error(ErrorMessages.PHONE_ALREADY_EXISTS);
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
 
    const subject = "ServoFixo Partner - Verify your email";
    const text = `Welcome to ServoFixo Partner! Your registration OTP is: ${otp}. It is valid for ${this._otpExpiryMinutes} minutes.`;

    await this._emailService.sendTextEmail(normalizedEmail, subject, text);

    this._logger.info(`${LogEvents.AUTH_OTP_SENT} (Technician Reg) - SessionID: ${sessionId}`);

    return {
      message: "OTP sent to email for registration",
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