import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { ILogger } from '../../interfaces/ILogger';
import { LogEvents } from '../../../../../shared/constants/LogEvents';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class ToggleServiceItemStatusUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string, isActive: boolean): Promise<void> {
    this._logger.info(`${LogEvents.SERVICE_TOGGLE_STATUS_INIT} - ID: ${id} to ${isActive}`);
    
    const success = await this._serviceRepo.toggleStatus(id, isActive);
    if (!success) {
      this._logger.error(`${LogEvents.SERVICE_TOGGLE_STATUS_FAILED} - ID: ${id}`);
      throw new Error(ErrorMessages.SERVICE_NOT_FOUND);
    }
    this._logger.info(`${LogEvents.SERVICE_TOGGLE_STATUS_SUCCESS} - ID: ${id}`);
  }
}