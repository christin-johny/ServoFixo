import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IJwtService, JwtPayload } from '../../application/services/IJwtService';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';

export class JwtService implements IJwtService {
  private readonly accessSecret: Secret;
  private readonly refreshSecret: Secret;
  private readonly accessExpiresIn: SignOptions['expiresIn'];
  private readonly refreshExpiresIn: SignOptions['expiresIn'];

  constructor() {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets are not configured');
    }

    this.accessSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;

    this.accessExpiresIn =
      (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) || '15m';
    this.refreshExpiresIn =
      (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '5d';
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: this.accessExpiresIn,
    };

    const token = jwt.sign(payload as object, this.accessSecret, options);
    return token;
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: this.refreshExpiresIn,
    };

    const token = jwt.sign(payload as object, this.refreshSecret, options);
    return token;
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as jwt.JwtPayload;

      const payload: JwtPayload = {
        sub: String(decoded.sub),
        roles: Array.isArray(decoded.roles)
          ? decoded.roles.map((r) => String(r))
          : [],
        type: decoded.type as JwtPayload['type'],
      };

      return payload;
    } catch (err: any) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as jwt.JwtPayload;

      const payload: JwtPayload = {
        sub: String(decoded.sub),
        roles: Array.isArray(decoded.roles)
          ? decoded.roles.map((r) => String(r))
          : [],
        type: decoded.type as JwtPayload['type'],
      };

      return payload;
    } catch (err: any) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }
  }
}
