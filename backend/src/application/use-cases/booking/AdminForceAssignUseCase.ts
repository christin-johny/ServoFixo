import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService";
import { ILogger } from "../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
// ✅ 1. Import SocketServer
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
    if (!tech) throw new Error("Technician not found");

    const techSnapshot = {
        name: tech.getName ? tech.getName() : (tech as any).name,
        phone: tech.getPhone ? tech.getPhone() : (tech as any).phone,
        avatarUrl: tech.getAvatarUrl ? tech.getAvatarUrl() : (tech as any).avatarUrl,
        rating: tech.getRatings().averageRating || 0
    };

    // Execute Logic
    booking.adminForceAssign(
        input.technicianId, 
        { tech: techSnapshot, adminName: input.adminId }
    );

    // Persist
    await this._bookingRepo.update(booking);

    // --- ✅ 2. REAL-TIME SOCKET EMISSION (THE FIX) ---
    const io = SocketServer.getInstance();
    const payload = {
        bookingId: booking.getId(),
        status: "ACCEPTED",
        updatedBy: "Admin"
    };

    // A. Force refresh on Technician App
    io.to(input.technicianId).emit("booking:status_update", payload);
    // Also emit 'booking:confirmed' to trigger the "Active Job" redirection if they are on dashboard
    io.to(input.technicianId).emit("booking:confirmed", {
        bookingId: booking.getId(),
        status: "ACCEPTED",
        techName: techSnapshot.name // Payload matches what frontend expects
    });
 
    io.to(booking.getCustomerId()).emit("booking:status_update", payload);
     
    await this._notificationService.send({
        recipientId: input.technicianId,
        recipientType: "TECHNICIAN",
        type: "BOOKING_CONFIRMED" as any, 
        title: "New Job Assigned (Admin) ⚡",
        body: "Admin has manually assigned a job to you.",
        metadata: { bookingId: booking.getId() }
    });

    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: "BOOKING_CONFIRMED" as any,
        title: "Technician Assigned",
        body: `${techSnapshot.name} has been assigned to your request.`,
        metadata: { bookingId: booking.getId() }
    });

    this._logger.info(`Admin ${input.adminId} forced assigned Tech ${input.technicianId} to Booking ${booking.getId()}`);
  }
}