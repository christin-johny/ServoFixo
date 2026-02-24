 import { IBookingRepository, PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { BookingStatus } from "../../../domain/value-objects/BookingTypes";
import { GetAllBookingsDto } from "../../dto/booking/BookingDto";
import { IGetAllBookingsUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";



export class GetAllBookingsUseCase implements IGetAllBookingsUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository
  ) {}

  async execute(input: GetAllBookingsDto): Promise<PaginatedBookingResult> { 
    let statusFilter: BookingStatus[] | undefined;
    if (input.status) {
      statusFilter = Array.isArray(input.status) ? input.status : [input.status];
    }
 
    return await this._bookingRepo.findAllPaginated(
      input.page,
      input.limit,
      {
        search: input.search,
        status: statusFilter,
        zoneId: input.zoneId,
        categoryId: input.categoryId,  
        startDate: input.startDate,
        endDate: input.endDate,
        sortBy: input.sortBy || "newest"
      }
    );
  }
}