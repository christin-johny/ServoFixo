import { Request, Response } from 'express';
import { GetMostBookedServicesUseCase } from '../../../application/use-cases/service-items/GetMostBookedServicesUseCase';
// 👇 CHANGE 1: Import the new Use Case
import { GetServiceListingUseCase } from '../../../application/use-cases/service-items/GetServiceListingUseCase'; 
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class CustomerServiceController {
  constructor(
    private readonly getMostBookedUseCase: GetMostBookedServicesUseCase,
    // 👇 CHANGE 2: Inject the new Use Case
    private readonly getServiceListingUseCase: GetServiceListingUseCase 
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

  // 👇 CHANGE 3: Update this method to handle advanced filters
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Extract all possible query params
      const { 
        search, 
        categoryId, 
        minPrice, 
        maxPrice, 
        sort 
      } = req.query;

      const filters = {
        searchTerm: search as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sort as any, // 'price_asc' | 'price_desc' | etc.
        isActive: true // Always enforce this for customers
      };

      const services = await this.getServiceListingUseCase.execute(filters);

      return res.status(StatusCodes.OK).json({
        success: true,
        count: services.length,
        data: services
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: ErrorMessages.INTERNAL_ERROR 
      });
    }
  };
}