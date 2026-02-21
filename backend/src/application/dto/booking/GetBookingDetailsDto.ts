import { UserRoleType } from "../../../domain/enums/UserRole"; 

export class GetBookingDetailsDto {
  bookingId!: string;
  userId!: string;
  role!: UserRoleType;  
}