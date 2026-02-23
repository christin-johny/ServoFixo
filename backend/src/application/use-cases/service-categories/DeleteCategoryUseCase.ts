import { IServiceCategoryRepository } from '../../../domain/repositories/IServiceCategoryRepository';
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { ErrorMessages } from '../../constants/ErrorMessages';

export class DeleteCategoryUseCase {
  constructor(
    private readonly _categoryRepo: IServiceCategoryRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    

    const category = await this._categoryRepo.findById(id);
    if (!category) {
      this._logger.warn(`${LogEvents.CATEGORY_DELETE_FAILED} - ${LogEvents.CATEGORY_NOT_FOUND} - ID: ${id}`);
      throw new Error(ErrorMessages.CATEGORY_NOT_FOUND);
    }

    await this._categoryRepo.delete(id);
    
  }
}