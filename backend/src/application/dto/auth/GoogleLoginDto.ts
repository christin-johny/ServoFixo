export interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface GoogleLoginRequest {
  token?: string;
  customer?: object;
}