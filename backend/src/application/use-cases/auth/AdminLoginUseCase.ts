
// 1️⃣ Import domain-level dependencies (interfaces & entities)
import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';

// 2️⃣ Import application-level dependencies (services)
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { IJwtService, JwtPayload } from '../../services/IJwtService';

// 3️⃣ Import shared DTO for input
import { AdminLoginDto } from '../../../../../shared/types/dto/AuthDtos';

// 4️⃣ Import application DTO for output
import { AuthResultDto } from '../../dto/auth/AuthResultDto';
import {ErrorMessages} from '../../../../../shared/types/enums/ErrorMessages'
/**
 * AdminLoginUseCase
 *
 * Use Case: "Admin logs in using email & password, gets back a JWT token."
 *
 * Responsibilities:
 * - Take email & password as input.
 * - Fetch admin by email via IAdminRepository.
 * - Compare password using IPasswordHasher.
 * - If valid, generate a JWT via IJwtService.
 * - Return AuthResultDto (token).
 *
 * It DOES NOT:
 * - Handle HTTP requests/responses (no req/res).
 * - Talk directly to Mongo/Mongoose.
 * - Use bcrypt/jsonwebtoken directly.
 */
export class AdminLoginUseCase {
  // Dependencies are injected (DI) for testability & decoupling
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  /**
   * Execute the use case.
   *
   * @param input - AdminLoginDto (email, password)
   * @returns AuthResultDto (JWT token)
   *
   * Throws Error if:
   * - Admin not found
   * - Password mismatch
   *
   * (Later we can replace Error with custom error types)
   */
  async execute(input: AdminLoginDto): Promise<AuthResultDto> {
    const { email, password } = input;

    // 1️⃣ Find admin by email
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      // In real app, you might throw a custom error like InvalidCredentialsError
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    // NOTE:
    // `admin` here is an Admin entity (from domain),
    // but we only have getters (we wrote getEmail(), but not getPassword()).
    // We need a getter for password in Admin entity for this to work.

    // 👉 Make sure your Admin entity has:
    // getPassword(): string { return this.password; }

    // 2️⃣ Compare the provided password with stored hashed password
    const passwordMatches = await this.passwordHasher.compare(
      password,
      (admin as any)['password'] // TEMP: better to add getPassword() in Admin entity
    );

    if (!passwordMatches) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    }

    // 3️⃣ Build JWT payload
    const payload: JwtPayload = {
      sub: admin.getId(),      // subject = admin id
      roles: (admin as any)['roles'] || ['admin'], // again, better with getRoles()
      type: 'admin',
    };

    // 4️⃣ Generate JWT token
    const token = await this.jwtService.sign(payload);

    // 5️⃣ Return result DTO
    const result: AuthResultDto = { token };

    return result;
  }
}
