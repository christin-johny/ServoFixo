import { IZoneRepository } from '../../../domain/repositories/IZoneRepository';
import { ILogger } from '../../interfaces/services/ILogger';
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { ErrorMessages } from '../../constants/ErrorMessages';
import { IDeleteZoneUseCase } from '../../interfaces/use-cases/zone/IZoneUseCases';

export class DeleteZoneUseCase implements IDeleteZoneUseCase {
  constructor(
    private readonly _zoneRepository: IZoneRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string): Promise<boolean> {
    const deleted = await this._zoneRepository.delete(id);
    if (!deleted) {
      this._logger.warn(LogEvents.ZONE_DELETE_FAILED, { id, reason: ErrorMessages.ZONE_NOT_FOUND });
      throw new Error(ErrorMessages.ZONE_DELETE_FAILED);
    }
    
    return true;
  }
}