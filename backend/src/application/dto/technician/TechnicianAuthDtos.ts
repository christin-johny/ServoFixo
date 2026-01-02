import { Phone } from "../../../../../shared/types/value-objects/ContactTypes";

// Input for Step 1: Request OTP
export class TechnicianRegisterInitDto {
  email!: string;
  phone!: Phone;
}

// Input for Step 2: Verify OTP & Create Account
export class TechnicianRegisterVerifyDto {
  email!: string;
  phone!: Phone;
  name!: string;
  password!: string;
  otp!: string;
  sessionId!: string;
}
export class TechnicianForgotPasswordInitDto {
  email!: string;
}

export class TechnicianForgotPasswordVerifyDto {
  email!: string;
  otp!: string;
  sessionId!: string;
  newPassword!: string;
}