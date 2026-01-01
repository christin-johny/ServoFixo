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