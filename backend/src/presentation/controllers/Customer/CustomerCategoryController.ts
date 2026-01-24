// src/presentation/controllers/Customer/CustomerCategoryController.ts

import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { RequestMapper } from '../../utils/RequestMapper';
import { IUseCase } from '../../../application/interfaces/IUseCase';
import { ILogger } from '../../../application/interfaces/ILogger';
import { LogEvents } from '../../../../../shared/constants/LogEvents';
import { CategoryQueryParams } from '../../../domain/repositories/IServiceCategoryRepository';
import { PaginatedCategoriesResponse } from '../../../application/use-cases/service-categories/GetAllCategoriesUseCase';

export class CustomerCategoryController extends BaseController {
  constructor( 
    private readonly _getAllCategoriesUseCase: IUseCase<PaginatedCategoriesResponse, [CategoryQueryParams]>,
    _logger: ILogger  
  ) {
    super(_logger);
  }

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(`${LogEvents.CATEGORY_GET_ALL_INIT} - Customer View`);
  
      const params: CategoryQueryParams = {
        ...RequestMapper.toPagination(req.query),
        isActive: true,
      };

      const result = await this._getAllCategoriesUseCase.execute(params);

   
      return this.ok(res, result.categories);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.CATEGORY_GET_ALL_ERROR);
    }
  };
}