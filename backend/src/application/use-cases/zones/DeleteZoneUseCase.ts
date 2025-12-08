import { IZoneRepository } from '../../../domain/repositories/IZoneRepository';

export class DeleteZoneUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(id: string): Promise<boolean> {
    const deleted = await this.zoneRepository.delete(id);
    if (!deleted) {
      throw new Error('Zone not found or could not be deleted');
    }
    return true;
  }
}