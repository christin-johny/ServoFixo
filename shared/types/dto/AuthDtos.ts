
import { OtpContext } from '../enums/OtpContext'; 


export interface CustomerRegisterDto {
  name: string; 
  phone?: string;
  email: string; 
  password: string; 
}


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