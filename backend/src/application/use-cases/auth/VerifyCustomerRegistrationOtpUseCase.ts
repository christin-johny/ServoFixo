import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import redis from "../../../infrastructure/redis/redisClient";
import { IOtpSessionRepository } from "../../../domain/repositories/IOtpSessionRepository";
import { IPasswordHasher } from "../../services/IPasswordHasher";
import { IJwtService, JwtPayload } from "../../services/IJwtService";
import { CustomerRegisterVerifyDto } from "../../../../../shared/types/dto/AuthDtos";
import { AuthResultDto } from "../../dto/auth/AuthResultDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { OtpContext } from "../../../../../shared/types/enums/OtpContext";
import { Customer } from "../../../domain/entities/Customer";

export class VerifyCustomerRegistrationOtpUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly otpSessionRepository: IOtpSessionRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(input: CustomerRegisterVerifyDto): Promise<AuthResultDto> {
    const { email, otp, sessionId, name, password, phone } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const existingCustomer = await this.customerRepository.findByEmail(
      normalizedEmail
    );
    if (existingCustomer) {
      throw new Error(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }
    if (phone) {
      const existingPhone = await this.customerRepository.findByPhone(phone);
      if (existingPhone) {
        throw new Error(ErrorMessages.PHONE_ALREADY_EXISTS);
      }
    }
    const session = await this.otpSessionRepository.findValidSession(
      normalizedEmail,
      sessionId,
      OtpContext.Registration
    );
    if (!session) {
      throw new Error(ErrorMessages.OTP_SESSION_INVALID);
    }
    if (session.getOtp() !== otp) {
      throw new Error(ErrorMessages.OTP_INVALID);
    }
    session.markAsUsed();
    await this.otpSessionRepository.save(session);

    const hashedPassword = await this.passwordHasher.hash(password);

    const customer = new Customer(
      "",
      name,
      normalizedEmail, 
      hashedPassword,
      phone,
      undefined,
      undefined,
      false,
      {},
      undefined,
      new Date(),
      new Date(),
      false
    );
    const savedCustomer = await this.customerRepository.create(customer);

    const payload: JwtPayload = {
      sub: savedCustomer.getId(),
      type: "customer",
    };
    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    const ttlSeconds = parseInt(
      process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
      10
    );
    try {
      await redis.set(
        `refresh:${refreshToken}`,
        String(savedCustomer.getId()),
        "EX",
        ttlSeconds
      );
    } catch (_) {}

    return { accessToken, refreshToken };
  }
}
