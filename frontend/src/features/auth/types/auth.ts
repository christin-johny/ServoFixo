export interface UserDto {
  id?: string;
  email?: string;
  role?: "admin" | "customer" | "technician" | string;
}

export interface LoginResponse {
  accessToken: string;
  user?: UserDto;
}
export interface RefreshResponse {
  accessToken?: string;
  token?: string;
  user?: {
    id: string;
    role: string;
    [key: string]: unknown; 
  };
}

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  sessionId?: string; // Needed for OTP flow
  message?: string;
  user?: UserDto;
}

export interface CustomerLoginRequestDto {
  email: string;
  password: string;
}

export interface CustomerRegisterInitDto {
  email: string;
  phone: string;
}

export interface CustomerRegisterVerifyDto {
  email: string;
  phone: string;
  otp: string;
  sessionId: string;
  name: string;
  password: string;
}
export interface CustomerForgotPasswordInitDto {
  email: string;
}

export interface CustomerForgotPasswordVerifyDto {
  email: string;
  otp: string;
  sessionId: string;
  newPassword?: string;
}