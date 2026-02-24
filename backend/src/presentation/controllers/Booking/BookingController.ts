 import { Request, Response, NextFunction } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/services/IUseCase";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { SuccessMessages, ErrorMessages } from "../../../application/constants/ErrorMessages";
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
import { GetTechnicianHistoryDto } from "../../../application/use-cases/booking/GetTechnicianHistoryUseCase";
import { PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { BookingStatus } from "../../../domain/value-objects/BookingTypes"; 
import { GetCustomerBookingsDto } from "../../../application/use-cases/booking/GetCustomerBookingsUseCase";
import { VerifyPaymentDto } from '../../../application/dto/booking/VerifyPaymentDto';
import { UserRoleType } from "../../../domain/enums/UserRole";

interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

interface IFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export class BookingController extends BaseController {
  constructor(
    private readonly _createBookingUseCase: IUseCase<Booking, [CreateBookingRequestDto]>,
    private readonly _respondToBookingUseCase: IUseCase<void, [RespondToBookingDto]>, 
    private readonly _updateJobStatusUseCase: IUseCase<void, [UpdateJobStatusDto]>,
    private readonly _addExtraChargeUseCase: IUseCase<void, [AddExtraChargeDto, IFile?]>,
    private readonly _respondToExtraChargeUseCase: IUseCase<void, [RespondToExtraChargeDto]>,
    private readonly _completeJobUseCase: IUseCase<void, [CompleteJobDto, IFile?]>,
    private readonly _getBookingDetailsUseCase: IUseCase<Booking, [GetBookingDetailsDto]>,
    private readonly _customerCancelUseCase: IUseCase<void, [CancelBookingDto]>,
    private readonly _technicianCancelUseCase: IUseCase<void, [CancelBookingDto]>,
    private readonly _rateTechnicianUseCase: IUseCase<void, [RateTechnicianDto]>, 
    private readonly _getTechnicianHistoryUseCase: IUseCase<PaginatedBookingResult, [GetTechnicianHistoryDto]>, 
    private readonly _getCustomerBookingsUseCase: IUseCase<PaginatedBookingResult, [GetCustomerBookingsDto]>,
    private readonly _verifyPaymentUseCase: IUseCase<void, [VerifyPaymentDto]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  createBooking = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;
      if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);
      
      let targetCustomerId = userId;
      if (role === "ADMIN") {
        if (!req.body.customerId) throw new Error(ErrorMessages.ADMIN_CUSTOMER_ID_MISSING);
        targetCustomerId = req.body.customerId;
      }

      const input: CreateBookingRequestDto = {
        customerId: targetCustomerId,
        serviceId: req.body.serviceId, 
        zoneId: req.body.zoneId, 
        contact: req.body.contact,  
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
      return this.created(res, responseDto, SuccessMessages.BOOKING_CREATED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.BOOKING_CREATION_FAILED;
      next(err);
    }
  };

  startJob = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const bookingId = req.params.id;
      const { otp } = req.body;

      if (!otp) return this.clientError(res, ErrorMessages.OTP_MISSING);

      const input: UpdateJobStatusDto = {
        bookingId,
        technicianId,
        status: "IN_PROGRESS", 
        otp: otp
      };

      await this._updateJobStatusUseCase.execute(input);
      return this.ok(res, null, SuccessMessages.OTP_VERIFIED_JOB_STARTED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.START_JOB_FAILED;
      next(err);
    }
  };

  respondToBooking = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: RespondToBookingDto = {
        bookingId: req.params.id,
        technicianId,
        response: req.body.response,
        reason: req.body.reason
      };

      await this._respondToBookingUseCase.execute(input);
      const message = input.response === "ACCEPT" ? SuccessMessages.BOOKING_ACCEPTED : SuccessMessages.BOOKING_REJECTED_NEXT;
      return this.ok(res, null, message);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.BOOKING_RESPONSE_FAILED;
      next(err);
    }
  };

  getCustomerBookings = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const customerId = (req as AuthenticatedRequest).userId;
      if (!customerId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const input: GetCustomerBookingsDto = {
        customerId,
        page,
        limit,
        status: req.query.status as string
      };

      const result = await this._getCustomerBookingsUseCase.execute(input);
      return this.ok(res, {
        data: result.data.map(b => BookingMapper.toResponse(b)), 
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / limit)
      }, SuccessMessages.ALL_BOOKINGS_FETCHED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.GET_CUSTOMER_BOOKINGS_FAILED;
      next(err);
    }
  };

  updateJobStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
      return this.ok(res, null, `Job status updated to ${input.status}`);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.JOB_STATUS_UPDATE_FAILED;
      next(err);
    }
  };

  addExtraCharge = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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

      let proofFile: IFile | undefined;
      if (req.file) {
          proofFile = {
              buffer: req.file.buffer,
              originalName: req.file.originalname,
              mimeType: req.file.mimetype
          };
      }

      await this._addExtraChargeUseCase.execute(input, proofFile);
      return this.created(res, null, SuccessMessages.EXTRA_CHARGE_ADDED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.ADD_EXTRA_CHARGE_FAILED;
      next(err);
    }
  };

  respondToExtraCharge = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const customerId = (req as AuthenticatedRequest).userId;
      if (!customerId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: RespondToExtraChargeDto = {
        bookingId: req.params.id,
        customerId,
        chargeId: req.params.chargeId,
        response: req.body.response
      };

      await this._respondToExtraChargeUseCase.execute(input);
      return this.ok(res, null, `Charge ${input.response.toLowerCase()}d successfully.`);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.RESPOND_EXTRA_CHARGE_FAILED;
      next(err);
    }
  };

  getTechnicianHistory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const input: GetTechnicianHistoryDto = {
        technicianId,
        page,
        limit,
        search: req.query.search as string,
        status: req.query.status as BookingStatus
      };

      const result = await this._getTechnicianHistoryUseCase.execute(input);
      return this.ok(res, {
        data: result.data.map(b => BookingMapper.toResponse(b)), 
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / limit)
      }, SuccessMessages.HISTORY_FETCHED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.GET_TECH_HISTORY_FAILED;
      next(err);
    }
  };

  completeJob = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error(ErrorMessages.UNAUTHORIZED);
      
      const input: CompleteJobDto = {
        bookingId: req.params.id,
        technicianId
      }; 

      let proofFile: IFile | undefined;
      if (req.file) {
          proofFile = {
              buffer: req.file.buffer,
              originalName: req.file.originalname,
              mimeType: req.file.mimetype
          };
      }

      await this._completeJobUseCase.execute(input, proofFile);
      return this.ok(res, null, SuccessMessages.JOB_COMPLETED_INVOICE);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.JOB_COMPLETION_FAILED;
      next(err);
    }
  };

  getBookingDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { userId, role } = authReq;
      if (!userId || !role) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: GetBookingDetailsDto = {
        bookingId: req.params.id,
        userId,
        role: role as UserRoleType
      };

      const booking = await this._getBookingDetailsUseCase.execute(input);
      const responseDto = BookingMapper.toResponse(booking);
      return this.ok(res, responseDto, SuccessMessages.BOOKINGS_FETCHED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.GET_BOOKING_DETAILS_FAILED;
      next(err);
    }
  };

  cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;
      if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);

      const input: CancelBookingDto = {
        bookingId: req.params.id,
        userId,
        reason: req.body.reason
      }; 

      if (role === "customer") {
          await this._customerCancelUseCase.execute(input);
      } else if (role === "technician") {
          await this._technicianCancelUseCase.execute(input);
      } else {
          await this._customerCancelUseCase.execute(input); 
      }

      return this.ok(res, null, SuccessMessages.BOOKING_ACCEPTED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.BOOKING_CANCELLATION_FAILED;
      next(err);
    }
  };

  verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const input: VerifyPaymentDto = {
        bookingId: req.params.id,
        orderId: req.body.razorpay_order_id,
        paymentId: req.body.razorpay_payment_id,
        signature: req.body.razorpay_signature
      };

      await this._verifyPaymentUseCase.execute(input);
      return this.ok(res, null, SuccessMessages.PAYMENT_VERIFIED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.PAYMENT_VERIFICATION_FAILED;
      next(err);
    }
  };
  
  rateTechnician = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;  
      if (!userId || role !== "customer") {
        return this.forbidden(res, ErrorMessages.ONLY_CUSTOMERS_RATE);
      }

      const input: RateTechnicianDto = {
        bookingId: req.params.id,
        customerId: userId,
        rating: req.body.rating,
        comment: req.body.comment
      };

      if (!input.rating || input.rating < 1 || input.rating > 5) {
        return this.clientError(res, ErrorMessages.RATING_RANGE_ERROR);
      }

      await this._rateTechnicianUseCase.execute(input);
      return this.ok(res, null, SuccessMessages.RATING_SUBMITTED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.RATING_FAILED;
      next(err);
    }
  };
}