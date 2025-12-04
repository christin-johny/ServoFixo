
import { OtpContext } from '../enums/OtpContext'; 


export interface OtpLoginInitDto {
  email: string; 
}

export interface EmailPasswordLoginDto {
  email: string; 
  password: string; 
}


export interface AdminLoginDto {
  email: string; 
  password: string; 
}

export interface OtpVerifyDto {
  email: string; 
  otp: string; 
  context: OtpContext; 
  sessionId: string; 
}

export interface OtpResendDto {
  email: string; 
  sessionId: string; 
}

export interface AuthResponse {
  message?: string; 
  sessionId?: string; 
  token?: string; 
}

export interface CustomerLoginRequestDto {
  email: string;
  password: string;
}


export interface CustomerRegisterInitDto {
  email: string;
}

export interface CustomerRegisterVerifyDto {
  email: string;
  otp: string;
  sessionId: string;
  name: string;
  password: string;
  phone?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface CustomerForgotPasswordInitDto {
  email: string;
}

export interface CustomerForgotPasswordVerifyDto {
  email: string;
  otp: string;
  sessionId: string;
  newPassword: string;
}

