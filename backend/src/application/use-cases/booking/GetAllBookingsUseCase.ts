import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository, PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes";

export interface GetAllBookingsDto {
  page: number;
  limit: number;
  search?: string;  
  status?: BookingStatus | BookingStatus[];
  zoneId?: string;
  categoryId?: string;  
  startDate?: Date;
  endDate?: Date;
  sortBy?: "newest" | "oldest" | "updated";
}

export class GetAllBookingsUseCase implements IUseCase<PaginatedBookingResult, [GetAllBookingsDto]> {
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