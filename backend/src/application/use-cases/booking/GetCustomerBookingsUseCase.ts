import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository, PaginatedBookingResult } from "../../../domain/repositories/IBookingRepository";
import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes";

export interface GetCustomerBookingsDto {
  customerId: string;
  page: number;
  limit: number;
  status?: string;  
}

export class GetCustomerBookingsUseCase implements IUseCase<PaginatedBookingResult, [GetCustomerBookingsDto]> {
  constructor(private readonly _bookingRepo: IBookingRepository) {}

  async execute(input: GetCustomerBookingsDto): Promise<PaginatedBookingResult> {
    
    let statusFilter: BookingStatus | BookingStatus[] | undefined;
 
    switch (input.status) {
      case 'active':
        statusFilter = [
            "PENDING",             
            "REQUESTED",           
            "ASSIGNED_PENDING",    
            "CONFIRMED",           
            "ACCEPTED",            
            "EN_ROUTE",            
            "REACHED",             
            "IN_PROGRESS",         
            "EXTRAS_PENDING"       
        ] as BookingStatus[];
        break;

      case 'completed': 
        statusFilter = [
            "COMPLETED", 
            "PAID"
        ] as BookingStatus[];
        break;

      case 'cancelled': 
        statusFilter = [
            "CANCELLED", 
            "REJECTED", 
            "EXPIRED"
        ] as BookingStatus[];
        break;

      default:
        if (input.status) {
             statusFilter = input.status as BookingStatus;
        } else {
            statusFilter = undefined; 
        }
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