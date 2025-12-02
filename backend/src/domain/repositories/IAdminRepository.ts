// backend/src/domain/repositories/IAdminRepository.ts

import { Admin } from '../entities/Admin';

/**
 * IAdminRepository
 *
 * Contract for admin data access.
 * Used mainly for admin login (email + password).
 */
export interface IAdminRepository {

  findById(id: string): Promise<Admin | null>;

  findByEmail(email: string): Promise<Admin | null>;

  create(admin: Admin): Promise<Admin>;
}
