import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IPasswordHasher } from '../../interfaces/IPasswordHasher';
import {CustomerForgotPasswordVerifyDto,} from '../../dto/auth/AuthDtos';
import { ErrorMessages } from '../../constants/ErrorMessages';
import { OtpContext } from '../../../domain/enums/OtpContext';
import { Customer } from '../../../domain/entities/Customer';
import { ILogger } from '../../interfaces/ILogger'; 

export class VerifyCustomerForgotPasswordOtpUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _otpSessionRepository: IOtpSessionRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _logger: ILogger
  ) {}

  async execute(
    input: CustomerForgotPasswordVerifyDto
  ): Promise<{ message: string }> {
    const { email, otp, sessionId, newPassword } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const session = await this._otpSessionRepository.findValidSession(
      normalizedEmail,
      sessionId,
      OtpContext.ForgotPassword
    );

    if (!session) { 
      throw new Error(ErrorMessages.OTP_SESSION_INVALID);
    }

    if (session.getOtp() !== otp) { 
      throw new Error(ErrorMessages.OTP_INVALID);
    }

    session.markAsUsed();
    await this._otpSessionRepository.save(session);

    const customer = await this._customerRepository.findByEmail(normalizedEmail);
    if (!customer) {
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    const hashed = await this._passwordHasher.hash(newPassword);

    const updated = new Customer(
      customer.getId(),
      customer.getName(),
      customer.getEmail(),
      hashed,
      customer.getPhone(),
      undefined,   
      undefined,          
      false,  
      {},          
      undefined, 
      customer.getCreatedAt(),
      new Date(),
      customer.getIsDeleted()
    );


    await this._customerRepository.update(updated);

    return {
      message: 'Password reset successful. You can now log in with your new password.',
    };
  }
}