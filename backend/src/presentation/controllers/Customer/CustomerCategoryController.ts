import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { RequestMapper } from '../../utils/RequestMapper'; 
import { ILogger } from '../../../application/interfaces/services/ILogger';
import { LogEvents } from '../../../infrastructure/logging/LogEvents';
import { CategoryQueryParams } from '../../../domain/repositories/IServiceCategoryRepository'; 
import { IGetAllCategoriesUseCase } from '../../../application/interfaces/use-cases/category/ICategoryUseCases';

export class CustomerCategoryController extends BaseController {
  constructor( 
    private readonly _getAllCategoriesUseCase: IGetAllCategoriesUseCase,
    _logger: ILogger  
  ) {
    super(_logger);
  }

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const params: CategoryQueryParams = {
        ...RequestMapper.toPagination(req.query),
        isActive: true,
      };

      const result = await this._getAllCategoriesUseCase.execute(params);

      return this.ok(res, result.categories);
    } catch (error: unknown) { 
      (error as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_GET_ALL_ERROR;
      next(error);
    }
  };
}