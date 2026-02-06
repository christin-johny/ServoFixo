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

    if (input.role === UserRole.ADMIN) {
        return booking; 
    } 


    if (input.role === UserRole.CUSTOMER) { 
        const bookingCustomerId = String(booking.getCustomerId());
        if (bookingCustomerId !== input.userId) {
            throw new Error(ErrorMessages.UNAUTHORIZED);
        }
        return booking;
    }

    //  Technician Check 
    if (input.role === UserRole.TECHNICIAN) { 
        const reqUserId = input.userId; 
        const assignedTechId = booking.getTechnicianId() ? String(booking.getTechnicianId()) : null;
         
        const isAssigned = assignedTechId === reqUserId;
 
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