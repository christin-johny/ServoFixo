import { Phone } from "../../../../../shared/types/value-objects/ContactTypes";
 
export class TechnicianRegisterInitDto {
  email!: string;
  phone!: Phone;
}
 
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