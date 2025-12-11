import { Request, Response } from 'express';
import { GetMostBookedServicesUseCase } from '../../../application/use-cases/service-items/GetMostBookedServicesUseCase';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class CustomerServiceController {
  constructor(
    private readonly getMostBookedUseCase: GetMostBookedServicesUseCase
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
}