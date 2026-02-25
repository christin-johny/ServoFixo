import { AuthResultDto } from "../../../dto/auth/AuthResultDto";
import { 
  TechnicianRegisterInitDto, 
  TechnicianRegisterVerifyDto,
  TechnicianForgotPasswordInitDto,
  TechnicianForgotPasswordVerifyDto, 
  TechnicianLoginDto
} from "../../../dto/technician/TechnicianAuthDtos";



export interface ITechnicianLoginUseCase { 
  execute(input: TechnicianLoginDto): Promise<AuthResultDto>;
}

export interface IRequestTechnicianRegistrationOtpUseCase {
  execute(input: TechnicianRegisterInitDto): Promise<{ message: string; sessionId: string }>;
}

export interface IVerifyTechnicianRegistrationOtpUseCase {
  execute(input: TechnicianRegisterVerifyDto): Promise<AuthResultDto>;
}

export interface IRequestTechnicianForgotPasswordOtpUseCase {
  execute(input: TechnicianForgotPasswordInitDto): Promise<{ message: string; sessionId: string }>;
}

export interface IVerifyTechnicianForgotPasswordOtpUseCase {
  execute(input: TechnicianForgotPasswordVerifyDto): Promise<{ message: string }>;
}