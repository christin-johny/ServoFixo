
import { OtpContext } from '../enums/OtpContext'; 


export interface OtpLoginInitDto {
  email: string; 
}

// For /auth/customer/email-login or technician equivalent (fallback – but now main pass flow if needed)
export interface EmailPasswordLoginDto {
  email: string; 
  password: string; 
}

// For /auth/admin/login (email/pass only, as per timeline)
export interface AdminLoginDto {
  email: string; 
  password: string; 
}

// For /auth/customer/otp/verify (or technician)
export interface OtpVerifyDto {
  email: string; 
  otp: string; 
  context: OtpContext; 
  sessionId: string; 
}

// For /auth/customer/otp/resend
export interface OtpResendDto {
  email: string; 
  sessionId: string; 
}


export interface AuthResponse {
  message?: string; 
  sessionId?: string; 
  token?: string; 
}

// Login (email + password) – used only on client side,
// backend uses its own CustomerLoginDto in the use case if you prefer.
export interface CustomerLoginRequestDto {
  email: string;
  password: string;
}

// Registration – Step 1: send OTP
export interface CustomerRegisterInitDto {
  email: string;
}

// Registration – Step 2: verify OTP & create account
export interface CustomerRegisterVerifyDto {
  email: string;
  otp: string;
  sessionId: string;
  name: string;
  password: string;
  phone?: string;
}

// Refresh token
export interface RefreshTokenDto {
  refreshToken: string;
}

// Forgot password – Step 1
export interface CustomerForgotPasswordInitDto {
  email: string;
}

// Forgot password – Step 2
export interface CustomerForgotPasswordVerifyDto {
  email: string;
  otp: string;
  sessionId: string;
  newPassword: string;
}

