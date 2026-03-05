import cron from "node-cron";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../application/services/INotificationService"; 
import { ILogger } from "../../application/interfaces/services/ILogger";
import { Booking } from "../../domain/entities/Booking";
import { NotificationType } from "../../domain/value-objects/NotificationTypes";
import { NotificationMessages } from "../../application/constants/ErrorMessages";

export class BookingTimeoutScheduler {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _techRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  public start() {
    cron.schedule("*/10 * * * * *", async () => {
      await this.handleTimeouts();
    });
  }

  private async handleTimeouts() {
    try {
      // 1. Find Expired Bookings
      // We need a repository method for this specific query
      const expiredBookings = await this._bookingRepo.findExpiredAssignments();

      if (expiredBookings.length === 0) return;


      for (const booking of expiredBookings) {
        await this.processTimeout(booking);
      }
    } catch (err: any) {
      this._logger.error(`Scheduler Error: ${err.message}`);
    }
  }

  private async processTimeout(booking: Booking) {
    // 1. Identify the Ghost Technician (The one who ignored the request)
    // The current attempt is the last one in the array
    const attempts = booking.getAttempts();
    const currentAttemptIndex = attempts.length - 1;
    
    if (currentAttemptIndex < 0) return; 

    // 2. Mark as TIMEOUT in the Booking Entity
    // (You might need to add a public method in Booking.ts for this)
    // Logic: attempt.status = 'TIMEOUT'
    booking.handleAssignmentTimeout(); 

    // 3. Find Next Candidate (Re-using logic from CreateBooking, 
    // but simplified since candidates are already in the candidateIds array)
    const nextCandidateId = this.findNextCandidate(booking);

    if (nextCandidateId) {
        
        // Add new attempt
        booking.addAssignmentAttempt(nextCandidateId);
        
        // Persist updates
        await this._bookingRepo.update(booking);

        // Notify Next Tech (Socket)
        // We need to fetch service/earnings info again or store it in booking metadata
        await this.notifyNextTech(nextCandidateId, booking);

    } else {
      
        this._logger.warn(`Booking ${booking.getId()}: All candidates exhausted.`);
        
        booking.updateStatus("FAILED_ASSIGNMENT", "system", "All candidates timed out");
        await this._bookingRepo.update(booking);

        setTimeout(async () => {
  await this._notificationService.send({
    recipientId: booking.getCustomerId(),
    recipientType: "CUSTOMER",
    type: NotificationType.BOOKING_FAILED,
    title: NotificationMessages.TITLE_BOOKING_FAILED,
    body: "Sorry, all nearby technicians are busy. Please try again later.",
    metadata: { bookingId: booking.getId() }
  });
}, 3000);  
        
        await this._notificationService.send({
             recipientId: "ADMIN_BROADCAST_CHANNEL",
             recipientType: "ADMIN",
             type: NotificationType.ADMIN_BOOKING_FAILED,
             title: "Booking Failed (No Techs)",
             body: `Booking ${booking.getId()} failed after exhausting list.`,
             metadata: { bookingId: booking.getId() }
        });
    }
  }

  private findNextCandidate(booking: Booking): string | null {
      const allCandidates = booking.getCandidateIds();
      const usedCandidates = booking.getAttempts().map(a => a.techId);
       
      return allCandidates.find(id => !usedCandidates.includes(id)) || null;
  }

  private async notifyNextTech(techId: string, booking: Booking) { 
      const earnings = booking.getPricing().estimated;  
      
      await this._notificationService.sendBookingRequest(techId, {
          bookingId: booking.getId(),
          serviceName: booking.getSnapshots()?.service?.name || "Service",
          earnings: earnings,
          distance: "Check Map",  
          address: booking.getLocation().address,
          expiresAt: booking.getAssignmentExpiresAt()!
      });
  }
}