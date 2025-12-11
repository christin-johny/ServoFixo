import { Request, Response } from 'express';
import { GetMostBookedServicesUseCase } from '../../../application/use-cases/service-items/GetMostBookedServicesUseCase';
import { GetAllServiceItemsUseCase } from '../../../application/use-cases/service-items/GetAllServiceItemsUseCase'; // ✅ Import this
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class CustomerServiceController {
  constructor(
    private readonly getMostBookedUseCase: GetMostBookedServicesUseCase,
    private readonly getAllServiceItemsUseCase: GetAllServiceItemsUseCase 
  ) {}

  getMostBooked = async (req: Request, res: Response): Promise<Response> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const services = await this.getMostBookedUseCase.execute(limit);
      return res.status(StatusCodes.OK).json({ data: services });
    } catch (error) {
      console.error('Error fetching popular services:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: ErrorMessages.INTERNAL_ERROR 
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string; 

      const result = await this.getAllServiceItemsUseCase.execute({
        page,
        limit,
        search,
        categoryId, 
        isActive: true 
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('Error fetching services:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: ErrorMessages.INTERNAL_ERROR 
      });
    }
  };
}