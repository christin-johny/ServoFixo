import { UserRoleType } from "../../../../../shared/types/enums/UserRole"; 

export class GetBookingDetailsDto {
  bookingId!: string;
  userId!: string;
  role!: UserRoleType;  
}