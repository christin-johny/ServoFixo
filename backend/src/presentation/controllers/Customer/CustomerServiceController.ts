import { Request, Response } from "express";
import { GetMostBookedServicesUseCase } from "../../../application/use-cases/service-items/GetMostBookedServicesUseCase";
import { GetServiceListingUseCase } from "../../../application/use-cases/service-items/GetServiceListingUseCase";
import { GetServiceByIdUseCase } from "../../../application/use-cases/service-items/GetServiceByIdUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";


export class CustomerServiceController {
  constructor(
    private readonly getMostBookedUseCase: GetMostBookedServicesUseCase,
    private readonly getServiceListingUseCase: GetServiceListingUseCase,
    private readonly getServiceByIdUseCase: GetServiceByIdUseCase
  ) {}

  getMostBooked = async (req: Request, res: Response): Promise<Response> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const services = await this.getMostBookedUseCase.execute(limit);
      return res.status(StatusCodes.OK).json({ data: services });
    } catch (error) {
      console.error("Error fetching popular services:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { search, categoryId, minPrice, maxPrice, sortBy,page,limit } = req.query;
      
      const filters = {
        searchTerm: search as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as any,
        page:Number(page),
        limit:Number(limit),
        isActive: true,
      };
      const services = await this.getServiceListingUseCase.execute(filters);

      return res.status(StatusCodes.OK).json({
        success: true,
        count: services.length,
        data: services,
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const service = await this.getServiceByIdUseCase.execute(id);

      if (!service) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ success: false, message: ErrorMessages.SERVICE_NOT_FOUND });
      }

      return res.status(StatusCodes.OK).json({ success: true, data: service });
    } catch (error) {
      console.error("GetById Error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}
