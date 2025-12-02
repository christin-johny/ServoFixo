import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import {CustomerForgotPasswordVerifyDto,} from '../../../../../shared/types/dto/AuthDtos';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';
import { OtpContext } from '../../../../../shared/types/enums/OtpContext';
import { Customer } from '../../../domain/entities/Customer';

export class VerifyCustomerForgotPasswordOtpUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly otpSessionRepository: IOtpSessionRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(
    input: CustomerForgotPasswordVerifyDto
  ): Promise<{ message: string }> {
    const { email, otp, sessionId, newPassword } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // 1️⃣ Validate OTP session (ForgotPassword)
    const session = await this.otpSessionRepository.findValidSession(
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

    // 2️⃣ Mark session as used
    session.markAsUsed();
    await this.otpSessionRepository.save(session);

    // 3️⃣ Find customer
    const customer = await this.customerRepository.findByEmail(normalizedEmail);
    if (!customer) {
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    // 4️⃣ Hash new password
    const hashed = await this.passwordHasher.hash(newPassword);

    // 5️⃣ Create updated customer entity (same data, new password)
    const updated = new Customer(
  customer.getId(),
  customer.getName(),
  customer.getEmail(),
  hashed,
  customer.getPhone(),
  undefined,   
  undefined,   
  [],          
  false,       
  undefined,   
  {},          
  undefined, // googleId
  customer.getCreatedAt(),
  new Date()
);


    await this.customerRepository.update(updated);

    return {
      message: 'Password reset successful. You can now log in with your new password.',
    };
  }
}
