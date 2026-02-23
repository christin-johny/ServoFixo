import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IOtpSessionRepository } from "../../../../domain/repositories/IOtpSessionRepository";
import { IPasswordHasher } from "../../../interfaces/IPasswordHasher";
import { IJwtService, JwtPayload } from "../../../interfaces/IJwtService";
import { TechnicianRegisterVerifyDto } from "../../../dto/technician/TechnicianAuthDtos";
import { AuthResultDto } from "../../../dto/auth/AuthResultDto";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { OtpContext } from "../../../../domain/enums/OtpContext";
import { Technician } from "../../../../domain/entities/Technician";
import { ICacheService } from "../../../interfaces/ICacheService";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";

export class VerifyTechnicianRegistrationOtpUseCase {
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _jwtService: IJwtService,
    private readonly _cacheService: ICacheService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: TechnicianRegisterVerifyDto): Promise<AuthResultDto> {
    const { email, otp, sessionId, name, password, phone } = input;
    const normalizedEmail = email.toLowerCase().trim();

 
    const existingEmail = await this._technicianRepository.findByEmail(
      normalizedEmail
    );
    if (existingEmail) throw new Error(ErrorMessages.EMAIL_ALREADY_EXISTS);

    const existingPhone = await this._technicianRepository.findByPhone(phone);
    if (existingPhone) throw new Error(ErrorMessages.PHONE_ALREADY_EXISTS);
 
    const session = await this._otpSessionRepository.findValidSession(
      normalizedEmail,
      sessionId,
      OtpContext.Registration
    );

    if (!session) {
      this._logger.warn(`Invalid/Expired OTP Session: ${sessionId}`);
      throw new Error(ErrorMessages.OTP_SESSION_INVALID);
    }

    if (session.getOtp() !== otp) {
      this._logger.warn(`Incorrect OTP entered for: ${normalizedEmail}`);
      throw new Error(ErrorMessages.OTP_INVALID);
    }
 
    session.markAsUsed();
    await this._otpSessionRepository.save(session);
 
    const hashedPassword = await this._passwordHasher.hash(password);
 
    const technician = new Technician({
      id: "",
      name: name,
      email: normalizedEmail,
      phone: phone,
      password: hashedPassword,

      categoryIds: [],
      subServiceIds: [],
      zoneIds: [],
      documents: [],
       
      onboardingStep: 1, 
      experienceSummary: "",

      walletBalance: { currentBalance: 0, frozenAmount: 0, currency: "INR" },
      availability: {
        isOnline: false,
        isOnJob: false
      },
      ratings: { averageRating: 0, totalReviews: 0 },
      verificationStatus: "PENDING",
      isSuspended: false,
      portfolioUrls: [],

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedTechnician = await this._technicianRepository.create(technician);
 
 
    const payload: JwtPayload = {
      sub: savedTechnician.getId(),
      type: "technician",
    };

    const accessToken = await this._jwtService.generateAccessToken(payload);
    const refreshToken = await this._jwtService.generateRefreshToken(payload);
 
    const ttlSeconds = parseInt(
      process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
      10
    );
    try {
      await this._cacheService.set(
        `refresh:${refreshToken}`,
        String(savedTechnician.getId()),
        ttlSeconds
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.AUTH_REFRESH_FAILED, errorMessage);
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}