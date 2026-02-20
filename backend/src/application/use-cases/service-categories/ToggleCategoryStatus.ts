import { IServiceCategoryRepository } from '../../../domain/repositories/IServiceCategoryRepository';
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class ToggleCategoryStatusUseCase {
  constructor(
    private readonly _categoryRepo: IServiceCategoryRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string, isActive: boolean): Promise<void> {
    

    const success = await this._categoryRepo.toggleStatus(id, isActive);
    if (!success) {
      this._logger.error(`${LogEvents.CATEGORY_TOGGLE_STATUS_FAILED} - ID: ${id}`);
      throw new Error(ErrorMessages.CATEGORY_NOT_FOUND);
    }
    
    
  }
}