export interface JwtPayload {
  sub: string;
  type: 'admin' | 'customer' | 'technician';
}

export interface IJwtService {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: JwtPayload): Promise<string>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
}
