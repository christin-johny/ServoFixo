import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { SuccessMessages, ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Booking } from "../../../domain/entities/Booking";
import { CreateBookingRequestDto } from "../../../application/dto/booking/CreateBookingRequestDto";
import { RespondToBookingDto } from "../../../application/dto/booking/RespondToBookingDto";
import { UpdateJobStatusDto } from "../../../application/dto/booking/UpdateJobStatusDto";
import { BookingMapper } from "../../../application/mappers/BookingMapper";
import { AddExtraChargeDto } from "../../../application/dto/booking/AddExtraChargeDto";
import { RespondToExtraChargeDto } from "../../../application/dto/booking/RespondToExtraChargeDto";
import { CompleteJobDto } from "../../../application/dto/booking/CompleteJobDto";
import { GetBookingDetailsDto } from "../../../application/dto/booking/GetBookingDetailsDto";
import { CancelBookingDto } from "../../../application/dto/booking/CancelBookingDto";
import { RateTechnicianDto } from "../../../application/dto/booking/RateTechnicianDto"; 

interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

export class BookingController extends BaseController {
  constructor(
    private readonly _createBookingUseCase: IUseCase<Booking, [CreateBookingRequestDto]>,
    private readonly _respondToBookingUseCase: IUseCase<void, [RespondToBookingDto]>, 
    private readonly _updateJobStatusUseCase: IUseCase<void, [UpdateJobStatusDto]>,
    private readonly _addExtraChargeUseCase: IUseCase<void, [AddExtraChargeDto]>,
    private readonly _respondToExtraChargeUseCase: IUseCase<void, [RespondToExtraChargeDto]>,
    private readonly _completeJobUseCase: IUseCase<void, [CompleteJobDto]>,
    private readonly _getBookingDetailsUseCase: IUseCase<Booking, [GetBookingDetailsDto]>,
    private readonly _customerCancelUseCase: IUseCase<void, [CancelBookingDto]>,
    private readonly _technicianCancelUseCase: IUseCase<void, [CancelBookingDto]>,
    private readonly _rateTechnicianUseCase: IUseCase<void, [RateTechnicianDto]>,  
    _logger: ILogger
  ) {
    super(_logger);
  }

  /**
   * @route POST /api/bookings
   * @desc Customer creates a new booking (Flow A: Matchmaking)
   * @access Customer
   */
createBooking = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;

      if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);
      // GOD MODE LOGIC:
      // If Admin, use the 'customerId' from body. If Customer, use their token ID.
      let targetCustomerId = userId;
      
      if (role === "ADMIN") {
          if (!req.body.customerId) throw new Error("Admin must provide customerId");
          targetCustomerId = req.body.customerId;
      }
      const input: CreateBookingRequestDto = {
        customerId: targetCustomerId, // <--- Updated line
        serviceId: req.body.serviceId,
        zoneId: req.body.zoneId,
        location: {
          address: req.body.location?.address,
          coordinates: req.body.location?.coordinates,
          mapLink: req.body.location?.mapLink
        },
        requestedTime: req.body.requestedTime ? new Date(req.body.requestedTime) : undefined,
        meta: req.body.meta
      };
      const booking = await this._createBookingUseCase.execute(input);
      const responseDto = BookingMapper.toResponse(booking);

      // EFFECTIVE USE: this.created handles 201 + structure
      return this.created(res, responseDto, SuccessMessages.BOOKING_CREATED);

    } catch (err) {
      return this.handleError(res, err, LogEvents.BOOKING_CREATION_FAILED);
    }
  };

  /**
   * @route POST /api/bookings/:id/respond
   * @desc Technician accepts or rejects a booking (Flow B: Handshake)
   * @access Technician
   */
  respondToBooking = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const bookingId = req.params.id;
      const { response, reason } = req.body; 

      const input: RespondToBookingDto = {
        bookingId,
        technicianId,
        response,
        reason
      };

      await this._respondToBookingUseCase.execute(input);

      const message = response === "ACCEPT" 
        ? SuccessMessages.BOOKING_ACCEPTED 
        : "Booking rejected. Searching for next candidate...";

      // EFFECTIVE USE: this.ok handles 200 + structure
      return this.ok(res, null, message);

    } catch (err) {
      return this.handleError(res, err, "BOOKING_RESPONSE_FAILED");
    }
  };

  /**
   * @route PATCH /api/bookings/:id/status
   * @desc Technician updates job status (Flow C: EN_ROUTE -> REACHED -> IN_PROGRESS)
   * @access Technician
   */
  updateJobStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: UpdateJobStatusDto = {
        bookingId: req.params.id,
        technicianId,
        status: req.body.status, 
        location: req.body.location,
        otp: req.body.otp
      };

      await this._updateJobStatusUseCase.execute(input);

      // EFFECTIVE USE: this.ok handles 200 + structure
      return this.ok(res, null, `Job status updated to ${input.status}`);

    } catch (err) {
      return this.handleError(res, err, "JOB_STATUS_UPDATE_FAILED");
    }
  };

  /**
   * @route POST /api/bookings/:id/extras
   * @desc Technician adds an extra charge (Flow D)
   * @access Technician
   */
  addExtraCharge = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: AddExtraChargeDto = {
        bookingId: req.params.id,
        technicianId,
        title: req.body.title,
        amount: req.body.amount,
        description: req.body.description,
        proofUrl: req.body.proofUrl
      };

      await this._addExtraChargeUseCase.execute(input);

      // EFFECTIVE USE: this.created handles 201 + structure
      return this.created(res, null, "Extra charge added. Waiting for customer approval.");

    } catch (err) {
      return this.handleError(res, err, "ADD_EXTRA_CHARGE_FAILED");
    }
  };

  /**
   * @route POST /api/bookings/:id/extras/:chargeId/respond
   * @desc Customer Approves/Rejects an extra charge
   * @access Customer
   */
  respondToExtraCharge = async (req: Request, res: Response): Promise<Response> => {
    try {
      const customerId = (req as AuthenticatedRequest).userId;
      if (!customerId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const { id: bookingId, chargeId } = req.params;
      const { response } = req.body; 

      const input: RespondToExtraChargeDto = {
        bookingId,
        customerId,
        chargeId,
        response
      };

      await this._respondToExtraChargeUseCase.execute(input);

      // EFFECTIVE USE: this.ok handles 200 + structure
      return this.ok(res, null, `Charge ${response.toLowerCase()}d successfully.`);

    } catch (err) {
      return this.handleError(res, err, "RESPOND_EXTRA_CHARGE_FAILED");
    }
  };
  /**
   * @route POST /api/bookings/:id/complete
   * @desc Technician marks job as done and generates invoice (Flow E)
   * @access Technician
   */
  completeJob = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: CompleteJobDto = {
        bookingId: req.params.id,
        technicianId
      };

      await this._completeJobUseCase.execute(input);

      // EFFECTIVE USE: this.ok()
      return this.ok(res, null, "Job completed. Invoice sent to customer.");

    } catch (err) {
      return this.handleError(res, err, "JOB_COMPLETION_FAILED");
    }
  };
  /**
   * @route GET /api/bookings/:id
   * @desc Get booking details (Secured by Role)
   * @access Customer | Technician | Admin
   */
  getBookingDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;
      const role = authReq.role; // Middleware must provide this

      if (!userId || !role) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: GetBookingDetailsDto = {
        bookingId: req.params.id,
        userId,
        role: role as any // Cast to Enum
      };

      const booking = await this._getBookingDetailsUseCase.execute(input);
      const responseDto = BookingMapper.toResponse(booking);

      // EFFECTIVE USE: this.ok()
      return this.ok(res, responseDto, "Booking details fetched successfully.");

    } catch (err) {
      return this.handleError(res, err, "GET_BOOKING_DETAILS_FAILED");
    }
  };
  /**
   * @route POST /api/bookings/:id/cancel
   * @desc Smart Cancel (Routes to logic based on Role)
   */
  cancelBooking = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId, role } = req as AuthenticatedRequest; // Ensure middleware sets 'role'
      if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: CancelBookingDto = {
        bookingId: req.params.id,
        userId,
        reason: req.body.reason
      };

      if (role === "CUSTOMER") {
          await this._customerCancelUseCase.execute(input);
      } else if (role === "TECHNICIAN") {
          await this._technicianCancelUseCase.execute(input);
      } else {
          // Admin cancellation can reuse customer logic or have its own
          await this._customerCancelUseCase.execute(input); 
      }

      return this.ok(res, null, "Booking cancelled successfully.");

    } catch (err) {
      return this.handleError(res, err, "BOOKING_CANCELLATION_FAILED");
    }
  };

  
  rateTechnician = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;
      
      // 1. Guard Clause (Satisfies TypeScript that userId is not undefined)
      if (!userId || role !== "CUSTOMER") {
        return this.forbidden(res, "Only customers can rate technicians.");
      }

      const input: RateTechnicianDto = {
        bookingId: req.params.id,
        customerId: userId, // TypeScript now knows this is a string
        rating: req.body.rating,
        comment: req.body.comment
      };

      // Validate basic input
      if (!input.rating || input.rating < 1 || input.rating > 5) {
        return this.clientError(res, "Rating must be between 1 and 5.");
      }

      await this._rateTechnicianUseCase.execute(input);

      return this.ok(res, null, "Rating submitted successfully.");

    } catch (err) {
      return this.handleError(res, err, "RATING_FAILED");
    }
  };
}