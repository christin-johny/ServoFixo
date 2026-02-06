import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService";
import { ILogger } from "../../interfaces/ILogger";
import { ErrorMessages, NotificationMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
import { SocketServer } from "../../../infrastructure/socket/SocketServer"; 

export interface AdminForceAssignDto {
  bookingId: string;
  technicianId: string;
  adminId: string;
}

export class AdminForceAssignUseCase implements IUseCase<void, [AdminForceAssignDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _techRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: AdminForceAssignDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    const tech = await this._techRepo.findById(input.technicianId);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);

    const techSnapshot = {
        name: tech.getName ? tech.getName() : (tech as any).name,
        phone: tech.getPhone ? tech.getPhone() : (tech as any).phone,
        avatarUrl: tech.getAvatarUrl ? tech.getAvatarUrl() : (tech as any).avatarUrl,
        rating: tech.getRatings().averageRating || 0
    };
 
    booking.adminForceAssign(
        input.technicianId, 
        { tech: techSnapshot, adminName: input.adminId }
    );
 
    await this._bookingRepo.update(booking);
 
    const io = SocketServer.getInstance();
    const payload = {
        bookingId: booking.getId(),
        status: "ACCEPTED",
        updatedBy: "Admin"
    };
 
    io.to(input.technicianId).emit("booking:status_update", payload); 
    io.to(input.technicianId).emit("booking:confirmed", {
        bookingId: booking.getId(),
        status: "ACCEPTED",
        techName: techSnapshot.name  
    });
 
    io.to(booking.getCustomerId()).emit("booking:status_update", payload);
     
    await this._notificationService.send({
        recipientId: input.technicianId,
        recipientType: "TECHNICIAN",
        type: "BOOKING_CONFIRMED" as any, 
        title: NotificationMessages.TITLE_ADMIN_ASSIGNED,
        body: NotificationMessages.BODY_ADMIN_ASSIGNED,
        metadata: { bookingId: booking.getId() }
    });

    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: "BOOKING_CONFIRMED" as any,
        title: NotificationMessages.TITLE_TECH_ASSIGNED,
        body: `${techSnapshot.name}${NotificationMessages.BODY_TECH_ASSIGNED_SUFFIX}`,
        metadata: { bookingId: booking.getId() }
    });

    this._logger.info(`Admin ${input.adminId} forced assigned Tech ${input.technicianId} to Booking ${booking.getId()}`);
  }
}