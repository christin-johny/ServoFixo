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
        return booking; 
    } 


    // --- Customer Check ---
    if (input.role === UserRole.CUSTOMER) {
        // Convert both to strings to be safe
        const bookingCustomerId = String(booking.getCustomerId());
        if (bookingCustomerId !== input.userId) {
            throw new Error(ErrorMessages.UNAUTHORIZED);
        }
        return booking;
    }

    // --- Technician Check ---
    if (input.role === UserRole.TECHNICIAN) { 
        const reqUserId = input.userId; // Token ID is always string
        const assignedTechId = booking.getTechnicianId() ? String(booking.getTechnicianId()) : null;
        
        // 1. Check Assignment (String vs String)
        const isAssigned = assignedTechId === reqUserId;

        // 2. Check Candidate List (Map ObjectIds to Strings first)
        const candidateIds = booking.getCandidateIds().map(id => String(id));
        const isCandidate = candidateIds.includes(reqUserId);
 

        if (!isAssigned && !isCandidate) { 
            throw new Error(ErrorMessages.UNAUTHORIZED);
        }
        return booking;
    }

    throw new Error(ErrorMessages.UNAUTHORIZED);
  }
}