import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository, PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { ILogger } from "../../interfaces/ILogger"; 
import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes"; 

export interface GetTechnicianHistoryDto {
  technicianId: string;
  page: number;
  limit: number; 
  status?: BookingStatus | BookingStatus[]; 
  search?: string;
}

export class GetTechnicianHistoryUseCase implements IUseCase<PaginatedBookingResult, [GetTechnicianHistoryDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(input: GetTechnicianHistoryDto): Promise<PaginatedBookingResult> {
    return await this._bookingRepo.findAllPaginated(
      input.page,
      input.limit,
      {
        technicianId: input.technicianId,
        status: input.status,  
        search: input.search
      }
    );
  }
}