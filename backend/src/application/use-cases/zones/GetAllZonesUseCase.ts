// backend/src/application/use-cases/zones/GetAllZonesUseCase.ts

import { IZoneRepository } from '../../../domain/repositories/IZoneRepository';
import { Zone } from '../../../domain/entities/Zone';

export class GetAllZonesUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(): Promise<Zone[]> {
    return this.zoneRepository.findAll();
  }
}