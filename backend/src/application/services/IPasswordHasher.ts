
export interface IPasswordHasher {
  compare(plain: string, hashed: string): Promise<boolean>;
}
