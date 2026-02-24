import { Booking } from "../../../../domain/entities/Booking";
import { Technician } from "../../../../domain/entities/Technician";
import { CreateBookingRequestDto } from "../../../dto/booking/CreateBookingRequestDto";
import { RespondToBookingDto } from "../../../dto/booking/RespondToBookingDto";
import { UpdateJobStatusDto } from "../../../dto/booking/UpdateJobStatusDto";
import { AddExtraChargeDto } from "../../../dto/booking/AddExtraChargeDto";
import { RespondToExtraChargeDto } from "../../../dto/booking/RespondToExtraChargeDto";
import { CompleteJobDto } from "../../../dto/booking/CompleteJobDto";
import { CancelBookingDto } from "../../../dto/booking/CancelBookingDto";
import { VerifyPaymentDto } from "../../../dto/booking/VerifyPaymentDto";
import { RateTechnicianDto } from "../../../dto/booking/RateTechnicianDto";
import { AdminUpdatePaymentDto } from "../../../dto/admin/AdminUpdatePaymentDto";
import { PaginatedBookingResult } from "../../../../domain/repositories/IBookingRepository";
import { AdminForceAssignDto, AdminForceStatusDto, GetAllBookingsDto, GetCustomerBookingsDto, GetRecommendedTechniciansDto, GetTechnicianHistoryDto } from "../../../dto/booking/BookingDto";
import { IFile } from "../../../dto/file/FileDto";




export interface ICreateBookingUseCase {
    execute(input: CreateBookingRequestDto): Promise<Booking>;
}

export interface IRespondToBookingUseCase {
    execute(input: RespondToBookingDto): Promise<void>;
}

export interface IUpdateJobStatusUseCase {
    execute(input: UpdateJobStatusDto): Promise<void>;
}

export interface IAddExtraChargeUseCase {
    execute(input: AddExtraChargeDto, proofFile?: IFile): Promise<void>;
}

export interface IRespondToExtraChargeUseCase {
    execute(input: RespondToExtraChargeDto): Promise<void>;
}

export interface ICompleteJobUseCase {
    execute(input: CompleteJobDto, proofFile?: IFile): Promise<void>;
}

export interface IGetBookingDetailsUseCase {
    execute(input: { bookingId: string, userId: string, role: string }): Promise<Booking>;
}

export interface ICustomerCancelBookingUseCase {
    execute(input: CancelBookingDto): Promise<void>;
}

export interface ITechnicianCancelBookingUseCase {
    execute(input: CancelBookingDto): Promise<void>;
}

export interface IGetAllBookingsUseCase {
    execute(input: GetAllBookingsDto): Promise<PaginatedBookingResult>;
}

export interface IGetCustomerBookingsUseCase {
    execute(input: GetCustomerBookingsDto): Promise<PaginatedBookingResult>;
}

export interface IGetTechnicianHistoryUseCase {
    execute(input: GetTechnicianHistoryDto): Promise<PaginatedBookingResult>;
}

export interface IAdminForceAssignUseCase {
    execute(input: AdminForceAssignDto): Promise<void>;
}

export interface IAdminForceStatusUseCase {
    execute(input: AdminForceStatusDto): Promise<void>;
}

export interface IAdminUpdatePaymentUseCase {
    execute(input: AdminUpdatePaymentDto): Promise<void>;
}

export interface IVerifyPaymentUseCase {
    execute(input: VerifyPaymentDto): Promise<void>;
}

export interface IGetRecommendedTechniciansUseCase {
    execute(input: GetRecommendedTechniciansDto): Promise<Technician[]>;
}

export interface IRateTechnicianUseCase {
    execute(input: RateTechnicianDto): Promise<void>;
}