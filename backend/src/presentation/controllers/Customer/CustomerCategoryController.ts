import { Request, Response } from 'express';
import { IUseCase } from '../../../application/interfaces/IUseCase';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';
import { ILogger } from '../../../application/interfaces/ILogger';
import { LogEvents } from '../../../../../shared/constants/LogEvents';

interface CategoryQueryParams {
  isActive: boolean;
  page: number;
  limit: number;
}

interface CategoryResult {
  categories: unknown[];
  [key: string]: unknown;
}

export class CustomerCategoryController {
  constructor(
    private readonly _getAllCategoriesUseCase: IUseCase<CategoryResult, [CategoryQueryParams]>,
    private readonly _logger: ILogger
  ) {}

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(`${LogEvents.CATEGORY_GET_ALL_INIT} - Customer View`);

      const result = await this._getAllCategoriesUseCase.execute({
        isActive: true,
        page: 1,
        limit: 100
      });

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        data: result.categories 
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this._logger.error(
        LogEvents.CATEGORY_GET_ALL_ERROR,
        errorMessage
      );

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: ErrorMessages.INTERNAL_ERROR || 'Failed to fetch categories' 
      });
    }
  };
}
