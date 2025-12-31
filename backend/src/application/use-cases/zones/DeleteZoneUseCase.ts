import { IZoneRepository } from '../../../domain/repositories/IZoneRepository';

export class DeleteZoneUseCase {
  constructor(private readonly _zoneRepository: IZoneRepository) {}

  async execute(id: string): Promise<boolean> {
    const deleted = await this._zoneRepository.delete(id);
    if (!deleted) {
      throw new Error('Zone not found or could not be deleted');
    }
    return true;
  }
}