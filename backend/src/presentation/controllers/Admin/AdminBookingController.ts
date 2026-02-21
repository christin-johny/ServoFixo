import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { AdminForceAssignDto } from "../../../application/dto/admin/AdminForceAssignDto";
import { AdminForceStatusDto } from "../../../application/dto/admin/AdminForceStatusDto"; 
import { ErrorMessages } from "../../../application/constants/ErrorMessages";
import { AdminUpdatePaymentDto } from "../../../application/dto/admin/AdminUpdatePaymentDto";
import { GetAllBookingsDto } from "../../../application/use-cases/booking/GetAllBookingsUseCase";
import { BookingMapper } from "../../../application/mappers/BookingMapper";
import { PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";

interface AuthenticatedRequest extends Request {
  userId?: string; // Admin ID
  role?: string;
}

export class AdminBookingController extends BaseController {
  private : any;
  constructor(
    private readonly _adminForceAssignUseCase: IUseCase<void, [AdminForceAssignDto]>,
    private readonly _adminForceStatusUseCase: IUseCase<void, [AdminForceStatusDto]>, // <--- Injected
    private readonly _adminUpdatePaymentUseCase: IUseCase<void, [AdminUpdatePaymentDto]>,
    private readonly _getAllBookingsUseCase: IUseCase<PaginatedBookingResult, [GetAllBookingsDto]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  /**
   * @route POST /api/admin/bookings/:id/assign
   * @desc Admin manually assigns a technician (Bypasses acceptance flow)
   */
  forceAssign = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, err, "ADMIN_FORCE_ASSIGN_FAILED");
    }
  };

  /**
   * @route POST /api/admin/bookings/:id/status
   * @desc Admin manually updates booking status (e.g., Force Complete, Cancel)
   */
  forceStatus = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, err, "ADMIN_FORCE_STATUS_FAILED");
    }
  };
  updatePayment = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, err, "ADMIN_UPDATE_PAYMENT_FAILED");
    }
  };
  /**
   * @route GET /api/admin/bookings
   * @desc Global "God Mode" List - View ALL bookings with filters
   */
getAll = async (req: Request, res: Response): Promise<Response> => {
  try {
    const adminId = (req as AuthenticatedRequest).userId;
    if ((req as AuthenticatedRequest).role !== "admin") {
        return this.unauthorized(res, "Admins only.");
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    // Map Query Params to DTO
    const input: GetAllBookingsDto = {
      page,
      limit,
      search: req.query.search as string,
      status: req.query.status as any, 
      zoneId: req.query.zoneId as string,
      categoryId: req.query.categoryId as string, //   The new filter
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      sortBy: req.query.sortBy as any
    };

    const result = await this._getAllBookingsUseCase.execute(input);

    return this.ok(res, {
      data: result.data.map(b => BookingMapper.toResponse(b)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / limit)
    }, "All bookings fetched successfully");

  } catch (err) {
    return this.handleError(res, err, "ADMIN_GET_ALL_FAILED");
  }
};
}