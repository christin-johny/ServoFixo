
export interface IPasswordHasher {
  /**
   * Hash a plain text password.
   * Used during registration or password change.
   */
  hash(plain: string): Promise<string>;

  /**
   * Compare a plain text password with a hashed password.
   * Returns true if they match.
   */
  compare(plain: string, hashed: string): Promise<boolean>;
}
