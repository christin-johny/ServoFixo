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
      '',               
      name,
      normalizedEmail,
      hashedPassword,
      phone,
      undefined,         
      undefined,         
      [],                
      false,             
      undefined,        
      {},                
      undefined,         
      new Date(),
      new Date()
    );

    const savedCustomer = await this.customerRepository.create(customer);

    const payload: JwtPayload = {
      sub: savedCustomer.getId(),
      roles: ['customer'],
      type: 'customer',
    };
   
    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
