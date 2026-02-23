import { BookingStatus } from "../../../domain/value-objects/BookingTypes";

export class AdminForceStatusDto {
    bookingId!: string;
    adminId!: string;
    status!: BookingStatus;
    reason!: string;
}