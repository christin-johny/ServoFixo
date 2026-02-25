import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { BookingStatus } from "../../../domain/value-objects/BookingTypes"; 
import { GetTechnicianHistoryDto } from "../../dto/booking/BookingDto";
import { IGetTechnicianHistoryUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";
import { PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";

export class GetTechnicianHistoryUseCase implements IGetTechnicianHistoryUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository 
  ) {}

  async execute(input: GetTechnicianHistoryDto): Promise<PaginatedBookingResult> {
    let statusFilter: BookingStatus | BookingStatus[] | undefined;
 
    if (input.status === 'active') {
        statusFilter = ["ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING", "COMPLETED"];
    } else { 
        statusFilter = input.status as BookingStatus | BookingStatus[];
    }

    // Fetch entities from repository
    const result = await this._bookingRepo.findAllPaginated(
      input.page,
      input.limit,
      {
        technicianId: input.technicianId,
        status: statusFilter,  
        search: input.search
      }
    );

    

    return {
      data: result.data, 
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit)
    };
  }
}