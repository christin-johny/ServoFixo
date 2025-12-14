import { Request, Response } from 'express';
import { GetMostBookedServicesUseCase } from '../../../application/use-cases/service-items/GetMostBookedServicesUseCase';
// 👇 CHANGE 1: Import the new Use Case
import { GetServiceListingUseCase } from '../../../application/use-cases/service-items/GetServiceListingUseCase'; 
import { GetServiceByIdUseCase } from '../../../application/use-cases/service-items/GetServiceByIdUseCase';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class CustomerServiceController {
  constructor(
    private readonly getMostBookedUseCase: GetMostBookedServicesUseCase,
    // 👇 CHANGE 2: Inject the new Use Case
    private readonly getServiceListingUseCase: GetServiceListingUseCase,
    private readonly getServiceByIdUseCase : GetServiceByIdUseCase,
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


getById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const service = await this.getServiceByIdUseCase.execute(id);

        if (!service) {
             return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Service not found' });
        }

        // 👇 FIX 2: Add 'return' here for consistency
        return res.status(StatusCodes.OK).json({ success: true, data: service });
    } catch (error) {
      console.error("GetById Error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: ErrorMessages.INTERNAL_ERROR 
      });
    }
  };
}