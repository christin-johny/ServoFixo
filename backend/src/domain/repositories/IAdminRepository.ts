import { Admin } from "../entities/Admin";

export interface IAdminRepository {
  findById(id: string): Promise<Admin | null>;

  findByEmail(email: string): Promise<Admin | null>;

  create(admin: Admin): Promise<Admin>;
}
