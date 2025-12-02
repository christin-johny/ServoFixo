// backend/src/infrastructure/security/BcryptPasswordHasher.ts

import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../application/services/IPasswordHasher';

/**
 * BcryptPasswordHasher
 *
 * Infrastructure implementation of IPasswordHasher using bcryptjs.
 */
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
