import { Admin } from "../entities/Admin";
import { IBaseRepository } from "./IBaseRepository";

export interface IAdminRepository
  extends Pick<IBaseRepository<Admin>, "create" | "findById"> {
  // findById(id: string): Promise<Admin | null>;
  // create(admin: Admin): Promise<Admin>;
  findByEmail(email: string): Promise<Admin | null>;
}
