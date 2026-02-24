import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { ILogger } from '../../interfaces/services/ILogger';
import { LogEvents } from '../../../infrastructure/logging/LogEvents';
import { ErrorMessages } from '../../constants/ErrorMessages';
import { IToggleServiceItemStatusUseCase } from '../../interfaces/use-cases/serviceItem/IServiceItemUseCases';

export class ToggleServiceItemStatusUseCase implements IToggleServiceItemStatusUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string, isActive: boolean): Promise<void> {
    
    const success = await this._serviceRepo.toggleStatus(id, isActive);
    if (!success) {
      this._logger.error(`${LogEvents.SERVICE_TOGGLE_STATUS_FAILED} - ID: ${id}`);
      throw new Error(ErrorMessages.SERVICE_NOT_FOUND);
    }
  }
}