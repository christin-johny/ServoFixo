import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { SuccessMessages, ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { Booking } from "../../../domain/entities/Booking";
import { CreateBookingRequestDto } from "../../../application/dto/booking/CreateBookingRequestDto";
import { RespondToBookingDto } from "../../../application/dto/booking/RespondToBookingDto";
import { BookingMapper } from "../../../application/mappers/BookingMapper";

// Interface to ensure userId is available (from Auth Middleware)
interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class BookingController extends BaseController {
  constructor(
    private readonly _createBookingUseCase: IUseCase<Booking, [CreateBookingRequestDto]>,
    // Fixed: Correctly typed the response use case
    private readonly _respondToBookingUseCase: IUseCase<void, [RespondToBookingDto]>,
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
      const customerId = (req as AuthenticatedRequest).userId;
      if (!customerId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: CreateBookingRequestDto = {
        customerId: customerId,
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

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: SuccessMessages.BOOKING_CREATED,
        data: responseDto
      });

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
      const { response, reason } = req.body; // Expects "ACCEPT" or "REJECT"

      const input: RespondToBookingDto = {
        bookingId,
        technicianId,
        response,
        reason
      };

      // Execute logic (Atomic Lock / Recursive Re-assignment)
      await this._respondToBookingUseCase.execute(input);

      const message = response === "ACCEPT" 
        ? SuccessMessages.BOOKING_ACCEPTED 
        : "Booking rejected. Searching for next candidate...";

      return res.status(StatusCodes.OK).json({
        success: true,
        message: message
      });

    } catch (err) {
      // Use a distinct log event for response failures
      return this.handleError(res, err, "BOOKING_RESPONSE_FAILED");
    }
  };
}