import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository, PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes";

export interface GetCustomerBookingsDto {
  customerId: string;
  page: number;
  limit: number;
  status?: string; // We accept string here to handle 'active' keyword
}

export class GetCustomerBookingsUseCase implements IUseCase<PaginatedBookingResult, [GetCustomerBookingsDto]> {
  constructor(private readonly _bookingRepo: IBookingRepository) {}

  async execute(input: GetCustomerBookingsDto): Promise<PaginatedBookingResult> {
    
    let statusFilter: BookingStatus | BookingStatus[] | undefined;
 
    if (input.status === 'active') {
        statusFilter = [
            "REQUESTED", 
            "ASSIGNED_PENDING", 
            "ACCEPTED", 
            "EN_ROUTE", 
            "REACHED", 
            "IN_PROGRESS", 
            "EXTRAS_PENDING",
            "COMPLETED"
        ];
    } else if (input.status) {
        // If it's a specific status (e.g., 'COMPLETED')
        statusFilter = input.status as BookingStatus;
    }

    return await this._bookingRepo.findAllPaginated(
        input.page, 
        input.limit, 
        {
            customerId: input.customerId,
            status: statusFilter
        }
    );
  }
}