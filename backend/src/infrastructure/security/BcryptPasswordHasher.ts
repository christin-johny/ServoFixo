import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../../application/interfaces/IPasswordHasher";

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly _saltRounds: number;

  constructor(saltRounds: number = 10) {
    this._saltRounds = saltRounds;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this._saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
