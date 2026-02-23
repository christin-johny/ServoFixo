import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository, PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { ILogger } from "../../interfaces/ILogger"; 
import { BookingStatus } from "../../../domain/value-objects/BookingTypes"; 

export interface GetTechnicianHistoryDto {
  technicianId: string;
  page: number;
  limit: number;  
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
 
    if (input.status === 'active') {
        statusFilter = [
            "ACCEPTED", 
            "EN_ROUTE", 
            "REACHED", 
            "IN_PROGRESS", 
            "EXTRAS_PENDING",
            "COMPLETED"  
        ];
    } else { 
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