import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { IJwtService, JwtPayload } from '../../services/IJwtService';
import { AuthResultDto } from '../../dto/auth/AuthResultDto';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export interface CustomerLoginDto {
  email: string;
  password: string;
}

export class CustomerLoginUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(input: CustomerLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const customer = await this.customerRepository.findByEmail(normalizedEmail);
    if (!customer) throw new Error(ErrorMessages.INVALID_CREDENTIALS);

    const ok = await this.passwordHasher.compare(password, customer.getPassword());
    if (!ok) throw new Error(ErrorMessages.INVALID_CREDENTIALS);

    const payload: JwtPayload = {
      sub: customer.getId(),
      roles: ['customer'],
      type: 'customer',
    };

    return {
      accessToken: await this.jwtService.generateAccessToken(payload),
      refreshToken: await this.jwtService.generateRefreshToken(payload),
    };
  }
}
