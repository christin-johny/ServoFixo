import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { AdminForceAssignDto } from "../../../application/dto/admin/AdminForceAssignDto";
import { AdminForceStatusDto } from "../../../application/dto/admin/AdminForceStatusDto"; 
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { AdminUpdatePaymentDto } from "../../../application/dto/admin/AdminUpdatePaymentDto";

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
      if ((req as AuthenticatedRequest).role !== "ADMIN") throw new Error(ErrorMessages.UNAUTHORIZED);

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
      if ((req as AuthenticatedRequest).role !== "ADMIN") throw new Error(ErrorMessages.UNAUTHORIZED);

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
      if ((req as AuthenticatedRequest).role !== "ADMIN") {
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
}