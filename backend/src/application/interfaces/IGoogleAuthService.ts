export interface GoogleUserPayload {
  email: string;
  name?: string;
  googleId: string;
  picture?: string;
}

export interface IGoogleAuthService {
  verifyToken(token: string): Promise<GoogleUserPayload>;
}