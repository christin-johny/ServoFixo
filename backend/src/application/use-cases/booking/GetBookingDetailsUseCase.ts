import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { GetBookingDetailsDto } from "../../dto/booking/GetBookingDetailsDto";
import { Booking } from "../../../domain/entities/Booking";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { UserRole } from "../../../../../shared/types/enums/UserRole";

export class GetBookingDetailsUseCase implements IUseCase<Booking, [GetBookingDetailsDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository
  ) {}

  async execute(input: GetBookingDetailsDto): Promise<Booking> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    // --- GOD MODE CHECK ---
    if (input.role === UserRole.ADMIN) {
        return booking; // Admin can see everything
    }

    // --- Customer Check ---
    if (input.role === UserRole.CUSTOMER) {
        if (booking.getCustomerId() !== input.userId) {
            throw new Error(ErrorMessages.UNAUTHORIZED);
        }
        return booking;
    }

    // --- Technician Check ---
    if (input.role === UserRole.TECHNICIAN) {
        // Tech can see if:
        // 1. They are the assigned technician
        // 2. OR they are in the candidate list (Request Phase)
        const isAssigned = booking.getTechnicianId() === input.userId;
        const isCandidate = booking.getCandidateIds().includes(input.userId);

        if (!isAssigned && !isCandidate) {
            throw new Error(ErrorMessages.UNAUTHORIZED);
        }
        return booking;
    }

    throw new Error(ErrorMessages.UNAUTHORIZED);
  }
}