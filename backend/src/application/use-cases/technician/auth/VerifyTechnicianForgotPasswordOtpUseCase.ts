import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IOtpSessionRepository } from "../../../../domain/repositories/IOtpSessionRepository";
import { IPasswordHasher } from "../../../interfaces/IPasswordHasher";
import { TechnicianForgotPasswordVerifyDto } from "../../../dto/technician/TechnicianAuthDtos";
import { ErrorMessages, SuccessMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { OtpContext } from "../../../../../../shared/types/enums/OtpContext";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { Technician } from "../../../../domain/entities/Technician";

export class VerifyTechnicianForgotPasswordOtpUseCase {
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _logger: ILogger
  ) {}

  async execute(input: TechnicianForgotPasswordVerifyDto): Promise<{ message: string }> {
    const { email, otp, sessionId, newPassword } = input;
    const normalizedEmail = email.toLowerCase().trim();

 
    const session = await this._otpSessionRepository.findValidSession(
      normalizedEmail,
      sessionId,
      OtpContext.ForgotPassword
    );

    if (!session) {
      this._logger.warn(`Invalid OTP Session: ${sessionId}`);
      throw new Error(ErrorMessages.OTP_SESSION_INVALID);
    }

    if (session.getOtp() !== otp) {
      this._logger.warn(`Incorrect OTP for: ${normalizedEmail}`);
      throw new Error(ErrorMessages.OTP_INVALID);
    }
 
    session.markAsUsed();
    await this._otpSessionRepository.save(session);
 
    const technician = await this._technicianRepository.findByEmail(normalizedEmail);
    if (!technician) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }
 
    const hashedPassword = await this._passwordHasher.hash(newPassword);
 
    const props = technician.toProps();
    
    const updatedTechnician = new Technician({
        ...props,
        password: hashedPassword,
        updatedAt: new Date()
    });

    await this._technicianRepository.update(updatedTechnician);

 
    return {
      message: SuccessMessages.PASSWORD_RESET_SUCCESS,
    };
  }
}