import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { ILogger } from '../../interfaces/ILogger';
import { LogEvents } from '../../../../../shared/constants/LogEvents';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class DeleteServiceItemUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    this._logger.info(`${LogEvents.SERVICE_DELETE_INIT} - ID: ${id}`);
    
    const service = await this._serviceRepo.findById(id);
    if (!service) {
      this._logger.warn(`${LogEvents.SERVICE_DELETE_FAILED} - ${LogEvents.SERVICE_NOT_FOUND}`);
      throw new Error(ErrorMessages.SERVICE_NOT_FOUND);
    }

    await this._serviceRepo.delete(id);
    this._logger.info(`${LogEvents.SERVICE_DELETED} - ID: ${id}`);
  }
}