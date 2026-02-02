import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository, PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { ILogger } from "../../interfaces/ILogger"; 
import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes"; 

export interface GetTechnicianHistoryDto {
  technicianId: string;
  page: number;
  limit: number; 
  // ✅ FIX 1: Allow string here so we can pass "active"
  status?: string | BookingStatus | BookingStatus[]; 
  search?: string;
}

export class GetTechnicianHistoryUseCase implements IUseCase<PaginatedBookingResult, [GetTechnicianHistoryDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(input: GetTechnicianHistoryDto): Promise<PaginatedBookingResult> {
    
    let statusFilter: BookingStatus | BookingStatus[] | undefined;

    // ✅ FIX 2: Handle "active" status and INCLUDE 'COMPLETED'
    if (input.status === 'active') {
        statusFilter = [
            "ACCEPTED", 
            "EN_ROUTE", 
            "REACHED", 
            "IN_PROGRESS", 
            "EXTRAS_PENDING",
            "COMPLETED" // <--- 🔴 CRITICAL: Keep job visible during payment
        ];
    } else {
        // Pass through other statuses (e.g. 'CANCELLED' or specific filters)
        statusFilter = input.status as BookingStatus | BookingStatus[];
    }

    return await this._bookingRepo.findAllPaginated(
      input.page,
      input.limit,
      {
        technicianId: input.technicianId,
        status: statusFilter,  
        search: input.search
      }
    );
  }
}