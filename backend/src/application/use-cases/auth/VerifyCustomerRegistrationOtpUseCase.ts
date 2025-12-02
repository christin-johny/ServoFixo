import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { IJwtService, JwtPayload } from '../../services/IJwtService';
import { CustomerRegisterVerifyDto } from '../../../../../shared/types/dto/AuthDtos';
import { AuthResultDto } from '../../dto/auth/AuthResultDto';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';
import { OtpContext } from '../../../../../shared/types/enums/OtpContext';
import { Customer } from '../../../domain/entities/Customer';

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

    // 1️⃣ Find valid OTP session (Registration)
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

    // 2️⃣ Mark as used
    session.markAsUsed();
    await this.otpSessionRepository.save(session);

    // 3️⃣ Hash password
    const hashedPassword = await this.passwordHasher.hash(password);

    // 4️⃣ Create customer entity
    const customer = new Customer(
      '',                // id assigned by Mongo
      name,
      normalizedEmail,
      hashedPassword,
      phone,
      undefined,         // avatarUrl
      undefined,         // defaultZoneId
      [],                // addresses
      false,             // suspended
      undefined,         // suspendReason
      {},                // additionalInfo
      undefined,         // googleId
      new Date(),
      new Date()
    );

    const savedCustomer = await this.customerRepository.create(customer);

    // 5️⃣ Build JWT payload
    const payload: JwtPayload = {
      sub: savedCustomer.getId(),
      roles: ['customer'],
      type: 'customer',
    };

    // 6️⃣ Tokens
    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
