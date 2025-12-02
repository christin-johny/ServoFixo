
import { Technician } from '../entities/Technician';

export interface ITechnicianRepository {
 
  findById(id: string): Promise<Technician | null>;

  findByEmail(email: string): Promise<Technician | null>;

  create(technician: Technician): Promise<Technician>;

  update(technician: Technician): Promise<Technician>;
}
