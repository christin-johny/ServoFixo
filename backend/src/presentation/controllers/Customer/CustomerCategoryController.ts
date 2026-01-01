import { Request, Response } from 'express';
import { GetAllCategoriesUseCase } from '../../../application/use-cases/service-categories/GetAllCategoriesUseCase';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class CustomerCategoryController {
  constructor(private readonly _getAllCategoriesUseCase: GetAllCategoriesUseCase) {}

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
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
      console.error('Error fetching customer categories:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: ErrorMessages.INTERNAL_ERROR || 'Failed to fetch categories' 
      });
    }
  };
}