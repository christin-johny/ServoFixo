import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController"; 
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { AdminForceAssignDto } from "../../../application/dto/admin/AdminForceAssignDto";
import { AdminForceStatusDto } from "../../../application/dto/admin/AdminForceStatusDto"; 
import { ErrorMessages } from "../../../application/constants/ErrorMessages";
import { AdminUpdatePaymentDto } from "../../../application/dto/admin/AdminUpdatePaymentDto";
import { BookingMapper } from "../../../application/mappers/BookingMapper"; 
import { BookingStatus } from "../../../domain/value-objects/BookingTypes";
import { GetAllBookingsDto } from "../../../application/dto/booking/BookingDto";
import { IAdminForceAssignUseCase, IAdminForceStatusUseCase, IAdminUpdatePaymentUseCase, IGetAllBookingsUseCase } from "../../../application/interfaces/use-cases/booking/IBookingUseCases";

interface AuthenticatedRequest extends Request {
  userId?: string; 
  role?: string;
}

export class AdminBookingController extends BaseController {
   
  constructor(
    private readonly _adminForceAssignUseCase: IAdminForceAssignUseCase,
  private readonly _adminForceStatusUseCase: IAdminForceStatusUseCase,
  private readonly _adminUpdatePaymentUseCase: IAdminUpdatePaymentUseCase,
  private readonly _getAllBookingsUseCase: IGetAllBookingsUseCase,
    _logger: ILogger
  ) {
    super(_logger);
  }

  forceAssign = async (req: Request, res: Response,next: NextFunction): Promise<Response|void> => {
    try {
      const adminId = (req as AuthenticatedRequest).userId;
      if ((req as AuthenticatedRequest).role !== "admin") throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: AdminForceAssignDto = {
        bookingId: req.params.id,
        technicianId: req.body.technicianId,
        adminId: adminId!
      };

      await this._adminForceAssignUseCase.execute(input);

      return this.ok(res, null, "Technician assigned successfully.");

    } catch (err) { 
      (err as Error & { logContext?: string }).logContext = "ADMIN_FORCE_ASSIGN_FAILED" ;
      next(err);
    }
  };
 
  forceStatus = async (req: Request, res: Response,next: NextFunction): Promise<Response|void> => {
    try {
      const adminId = (req as AuthenticatedRequest).userId;
       
      if ((req as AuthenticatedRequest).role !== "admin") throw new Error(ErrorMessages.UNAUTHORIZED);
      
      const input: AdminForceStatusDto = {
        bookingId: req.params.id,
        adminId: adminId!,
        status: req.body.status,
        reason: req.body.reason || "Admin Override"
      };

      await this._adminForceStatusUseCase.execute(input);

      return this.ok(res, null, `Booking status forced to ${input.status}`);

    } catch (err) { 
      (err as Error & { logContext?: string }).logContext = "ADMIN_FORCE_STATUS_FAILED";
      next(err);
    }
  };
  updatePayment = async (req: Request, res: Response,next: NextFunction): Promise<Response|void> => {
    try {
      const adminId = (req as AuthenticatedRequest).userId;

      if ((req as AuthenticatedRequest).role !== "admin") {
         return this.unauthorized(res, "Admins only.");
      }

      const input: AdminUpdatePaymentDto = {
        bookingId: req.params.id,
        adminId: adminId!,
        status: req.body.status, // "PAID", "PENDING", etc.
        transactionId: req.body.transactionId // Optional
      };

      await this._adminUpdatePaymentUseCase.execute(input);

      return this.ok(res, null, `Payment status updated to ${input.status}`);

    } catch (err) { 
      (err as Error & { logContext?: string }).logContext = "ADMIN_UPDATE_PAYMENT_FAILED";
      next(err);
    }
  }; 
getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if ((req as AuthenticatedRequest).role !== "admin") {
      return this.unauthorized(res, "Admins only.");
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const input: GetAllBookingsDto = {
      page,
      limit,
      search: req.query.search as string,
      status: req.query.status as BookingStatus,
      zoneId: req.query.zoneId as string,
      categoryId: req.query.categoryId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      sortBy: req.query.sortBy as "newest" | "oldest" | "updated",
    };

    const result = await this._getAllBookingsUseCase.execute(input);

    // FIX: Use Promise.all to resolve the async mapping for S3 URLs
    const mappedData = await Promise.all(
      result.data.map(async (booking) => await BookingMapper.toResponse(booking))
    );

    return this.ok(res, {
      data: mappedData, // This will now contain the actual data
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages // Use the calculated value from the repository
    }, "All bookings fetched successfully");

  } catch (err) {
    (err as Error & { logContext?: string }).logContext = "ADMIN_GET_ALL_FAILED";
    next(err);
  }
};
}