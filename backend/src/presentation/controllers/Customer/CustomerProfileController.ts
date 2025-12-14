import { Request, Response, NextFunction } from "express";
import { GetCustomerByIdUseCase } from "../../../application/use-cases/customer/GetCustomerByIdUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

export class CustomerProfileController {
  constructor(
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId =
        (req as any).userId || (req as any).user?.id || (req as any).user?._id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const customer = await this.getCustomerByIdUseCase.execute(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };
}
