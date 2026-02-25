import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { ILogger } from '../../interfaces/services/ILogger';
import { LogEvents } from '../../../infrastructure/logging/LogEvents';
import { ErrorMessages } from '../../constants/ErrorMessages';
import { IDeleteServiceItemUseCase } from '../../interfaces/use-cases/serviceItem/IServiceItemUseCases';

export class DeleteServiceItemUseCase implements IDeleteServiceItemUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    
    
    const service = await this._serviceRepo.findById(id);
    if (!service) {
      this._logger.warn(`${LogEvents.SERVICE_DELETE_FAILED} - ${LogEvents.SERVICE_NOT_FOUND}`);
      throw new Error(ErrorMessages.SERVICE_NOT_FOUND);
    }

    await this._serviceRepo.delete(id);
    
  }
}