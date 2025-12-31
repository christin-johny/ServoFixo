import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IJwtService, JwtPayload } from '../../application/services/IJwtService';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';

export class JwtService implements IJwtService {
  private readonly _accessSecret: Secret;
  private readonly _refreshSecret: Secret;
  private readonly _accessExpiresIn: SignOptions['expiresIn'];
  private readonly _refreshExpiresIn: SignOptions['expiresIn'];

  constructor() {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets are not configured');
    }

    this._accessSecret = process.env.JWT_ACCESS_SECRET;
    this._refreshSecret = process.env.JWT_REFRESH_SECRET;

    this._accessExpiresIn =
      (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) || '15m';
    this._refreshExpiresIn =
      (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '5d';
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: this._accessExpiresIn,
    };

    const token = jwt.sign(payload as object, this._accessSecret, options);
    return token;
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: this._refreshExpiresIn,
    };

    const token = jwt.sign(payload as object, this._refreshSecret, options);
    return token;
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this._refreshSecret) as jwt.JwtPayload;

      const payload: JwtPayload = {
        sub: String(decoded.sub),
        type: decoded.type as JwtPayload['type'],
      };

      return payload;
    } catch (err: any) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this._accessSecret) as jwt.JwtPayload;

      const payload: JwtPayload = {
        sub: String(decoded.sub),
        type: decoded.type as JwtPayload['type'],
      };

      return payload;
    } catch (err: any) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }
  }
}
