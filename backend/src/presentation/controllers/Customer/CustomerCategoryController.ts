import { Request, Response } from 'express';
import { GetAllCategoriesUseCase } from '../../../application/use-cases/service-categories/GetAllCategoriesUseCase';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';

export class CustomerCategoryController {
  constructor(private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase) {}

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.getAllCategoriesUseCase.execute({
        isActive: true,
        page: 1,
        limit: 100
      });

      return res.status(StatusCodes.OK).json({ data: result.data });
    } catch (error) {
      console.error('Error fetching customer categories:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch categories' });
    }
  };
}