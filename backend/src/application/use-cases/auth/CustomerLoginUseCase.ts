import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import redis from '../../../infrastructure/redis/redisClient';
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
    
    if (customer.isSuspended()) {
       throw new Error(ErrorMessages.ACCOUNT_BLOCKED);
    }

    const ok = await this.passwordHasher.compare(password, customer.getPassword());
    if (!ok) throw new Error(ErrorMessages.INVALID_CREDENTIALS);

    const payload: JwtPayload = {
      sub: customer.getId(),
      type: 'customer',
    };

    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    const ttlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);
    try {
      await redis.set(`refresh:${refreshToken}`, String(customer.getId()), "EX", ttlSeconds);
    } catch (err) {
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
