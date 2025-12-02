// DTOs & types used across app
export interface UserDto {
  id?: string;
  email?: string;
  role?: "admin" | "customer" | "technician" | string;
}

export interface LoginResponse {
  accessToken: string;
  user?: UserDto;
}
