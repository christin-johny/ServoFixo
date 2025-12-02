
export interface JwtPayload {
  sub: string;          
  roles: string[];     
  type: 'admin';       
}

export interface IJwtService {
  sign(payload: JwtPayload): Promise<string>;
}
