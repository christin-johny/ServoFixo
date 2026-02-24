import {  
  AdminLoginDto, 
  CustomerRegisterInitDto, 
  CustomerRegisterVerifyDto,
  CustomerForgotPasswordInitDto,
  CustomerForgotPasswordVerifyDto,
  OtpLoginInitDto,
  AuthResponse
} from "../../../dto/auth/AuthDtos";
import { GoogleLoginRequest, GoogleLoginResponse } from "../../../dto/auth/GoogleLoginDto";
import { RefreshTokenResponse } from "../../../dto/auth/AuthDtos";
import { CustomerLoginDto } from "../../../dto/auth/CustomerLoginDto";
import { AuthResultDto } from "../../../dto/auth/AuthResultDto";


export interface IAdminLoginUseCase {
  execute(input: AdminLoginDto): Promise<AuthResultDto>;
}

export interface ICustomerLoginUseCase {
  execute(input: CustomerLoginDto): Promise<AuthResultDto>;
}

export interface ICustomerGoogleLoginUseCase {
  execute(request: GoogleLoginRequest): Promise<GoogleLoginResponse>;
}

export interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<RefreshTokenResponse>;
}

export interface IRequestCustomerRegistrationOtpUseCase {
  execute(input: CustomerRegisterInitDto): Promise<{ message: string; sessionId: string }>;
}

export interface IVerifyCustomerRegistrationOtpUseCase {
  execute(input: CustomerRegisterVerifyDto): Promise<AuthResultDto>;
}

export interface IRequestCustomerForgotPasswordOtpUseCase {
  execute(input: CustomerForgotPasswordInitDto): Promise<{ message: string; sessionId: string }>;
}

export interface IVerifyCustomerForgotPasswordOtpUseCase {
  execute(input: CustomerForgotPasswordVerifyDto): Promise<{ message: string }>;
}

export interface IRequestCustomerEmailOtpUseCase {
  execute(input: OtpLoginInitDto): Promise<AuthResponse>;
}