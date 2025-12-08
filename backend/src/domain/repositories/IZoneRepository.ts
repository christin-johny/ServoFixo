// backend/src/domain/repositories/IZoneRepository.ts

import { Zone } from '../entities/Zone';

export interface IZoneRepository {
  create(zone: Zone): Promise<Zone>;
  findAll(): Promise<Zone[]>;
  findById(id: string): Promise<Zone | null>;
  update(zone: Zone): Promise<Zone>;
  delete(id: string): Promise<boolean>;
  findByName(name: string): Promise<Zone | null>;
}