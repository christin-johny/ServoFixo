import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { IZoneService } from "../../interfaces/services/IZoneService";  
import { INotificationService } from "../../services/INotificationService"; 
import { CreateBookingRequestDto } from "../../dto/booking/CreateBookingRequestDto";
import { Booking } from "../../../domain/entities/Booking";
import { Technician } from "../../../domain/entities/Technician";
import { ErrorMessages, NotificationMessages } from "../../constants/ErrorMessages";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes"; 
import { S3UrlHelper } from "../../../infrastructure/storage/S3UrlHelper"; 
import { ICreateBookingUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";

export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _customerRepo: ICustomerRepository,
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _zoneService: IZoneService 
  ) {}

  async execute(input: CreateBookingRequestDto): Promise<Booking> {
      
    // 1. Validation: Customer
    const customer = await this._customerRepo.findById(input.customerId);
    if (!customer) {
      throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    // 2. Validation: Service
    const service = await this._serviceRepo.findById(input.serviceId);
    if (!service) {
      throw new Error(ErrorMessages.SERVICE_NOT_FOUND);
    } 

    // 3. Validation: Zone Integrity 
    const { lat, lng } = input.location.coordinates;
    const zoneResult = await this._zoneService.checkServiceability(lat, lng);

    if (!zoneResult.isServiceable || !zoneResult.zoneId) {
       throw new Error(ErrorMessages.LOCATION_NOT_SERVED);
    }
    
    const resolvedZoneId = zoneResult.zoneId;
    
    // 4. Calculate Estimates
    const rawPrice = service.getBasePrice ? service.getBasePrice() : (service as any).price || 0;
    const estimatedPrice = Math.round(rawPrice * 100) / 100; 
    const deliveryFee = 0; 

    // --- HYBRID LOGIC: Determine Scheduling Threshold ---
    const now = new Date();
    let isScheduled = false;
    let assignmentTimerSeconds = 60; // Default: 60s for ASAP

    if (input.requestedTime) {
        const timeDiffMs = input.requestedTime.getTime() - now.getTime();
        const hoursDiff = timeDiffMs / (1000 * 60 * 60);
        
        if (hoursDiff >= 2) {
            isScheduled = true;
            assignmentTimerSeconds = 30 * 60; // 30 minutes for scheduled jobs
        }
    }

    // 5. Matchmaking
    let availableTechs: Technician[] = [];

    if (isScheduled) {
        // Path B: Scheduled (Fetch all verified in zone, then filter calendar conflicts)
        const potentialTechs = await this._technicianRepo.findEligibleForScheduledJob(resolvedZoneId, input.serviceId);
        
        for (const tech of potentialTechs) {
            // Check for overlaps with a 2-hour buffer
            const hasOverlap = await this._bookingRepo.hasOverlappingBooking(tech.getId(), input.requestedTime!, 2);
            if (!hasOverlap) {
                availableTechs.push(tech);
            }
        }
    } else {
        // Path A: ASAP (Strictly online and not currently on a job)
        availableTechs = await this._technicianRepo.findAvailableInZone(
          resolvedZoneId, 
          input.serviceId 
        );
    }

    // 6. Sort Candidates
    const sortedCandidates = this.sortCandidates(
      availableTechs,
      input.location.coordinates
    );

    const candidateIds = sortedCandidates.map(t => t.getId());
 
    // 7. Initialize Booking
    const booking = new Booking({
      customerId: input.customerId,
      serviceId: input.serviceId,
      zoneId: resolvedZoneId,
      status: "REQUESTED",
      location: {
        address: input.location.address,
        coordinates: input.location.coordinates,
        mapLink: input.location.mapLink
      },
      pricing: {
        estimated: estimatedPrice,
        final: undefined,
        deliveryFee: deliveryFee,
        discount: 0,
        tax: 0
      },
      payment: { status: "PENDING" },
      candidateIds: candidateIds,
      assignedTechAttempts: [],
      extraCharges: [],
      timeline: [],
      meta: { instructions: input.meta?.instructions },
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
        scheduledAt: input.requestedTime
      }
    }); 
 
    const snapshotName = input.contact?.name || (customer.getName ? customer.getName() : (customer as any).name);
    const snapshotPhone = input.contact?.phone || (customer.getPhone ? customer.getPhone() : (customer as any).phone);

    if (!snapshotPhone) {
        throw new Error(ErrorMessages.PHONE_REQUIRED);
    }

    booking.setInitialSnapshots(
        { name: snapshotName, phone: snapshotPhone, avatarUrl: S3UrlHelper.getFullUrl(customer.getAvatarUrl()) },
        { name: service.getName ? service.getName() : (service as any).name, categoryId: service.getCategoryId() }
    );

    // 9. Prepare Assignment (Blast for Scheduled, Waterfall for ASAP)
    if (candidateIds.length > 0) {
      if (isScheduled) {
          // BLAST: Register attempts for every candidate immediately
          for (const techId of candidateIds) {
              booking.addAssignmentAttempt(techId, assignmentTimerSeconds);
          }
      } else {
          // WATERFALL: Register only the first candidate
          booking.addAssignmentAttempt(candidateIds[0], assignmentTimerSeconds);
      }
    } else {
      booking.updateStatus("FAILED_ASSIGNMENT", "system", "No available technicians in zone");
      
      setTimeout(async () => {
    await this._notificationService.send({
      recipientId: booking.getCustomerId(),
      recipientType: "CUSTOMER",
      type: NotificationType.BOOKING_FAILED,
      title: NotificationMessages.TITLE_BOOKING_FAILED,
      body: NotificationMessages.BODY_NO_TECHS,
      metadata: { bookingId: booking.getId() }
    });
  }, 3000);
    } 

    // 10. Persist
    const createdBooking = await this._bookingRepo.create(booking);

    // 11. Trigger Real-Time Notification 
    if (candidateIds.length > 0) {
        const serviceName = service.getName ? service.getName() : "Service Request";
        const earnings = Math.round((estimatedPrice * 0.9) * 100) / 100;

        if (isScheduled) {
            // BLAST: Notify all candidates simultaneously
            for (const tech of sortedCandidates) {
                let distKm = "0.0";
                const techLoc = tech.getCurrentLocation()?.coordinates;
                if (techLoc) {
                     const dist = this.calculateDistance(
                        input.location.coordinates.lat,
                        input.location.coordinates.lng,
                        techLoc[1],
                        techLoc[0]
                    );
                    distKm = dist.toFixed(1);
                }

                await this._notificationService.sendBookingRequest(tech.getId(), {
                    bookingId: createdBooking.getId(),
                    serviceName: serviceName,
                    earnings: earnings, 
                    distance: `${distKm} km`,
                    address: input.location.address,
                    expiresAt: createdBooking.getAssignmentExpiresAt() || new Date(Date.now() + (assignmentTimerSeconds * 1000)),
                    scheduledAt: input.requestedTime  
                });
            }
        } else {
            // WATERFALL: Only notify the first candidate
            const tech = sortedCandidates[0]; 
            let distKm = "0.0";
            const techLoc = tech.getCurrentLocation()?.coordinates;
            if (techLoc) {
                 const dist = this.calculateDistance(
                    input.location.coordinates.lat,
                    input.location.coordinates.lng,
                    techLoc[1],
                    techLoc[0]
                );
                distKm = dist.toFixed(1);
            }

            await this._notificationService.sendBookingRequest(tech.getId(), {
                bookingId: createdBooking.getId(),
                serviceName: serviceName,
                earnings: earnings, 
                distance: `${distKm} km`,
                address: input.location.address,
                expiresAt: createdBooking.getAssignmentExpiresAt() || new Date(Date.now() + 60000)
            });
        }

        // Admin Notification
        await this._notificationService.send({
            recipientId: "ADMIN_BROADCAST_CHANNEL", 
            recipientType: "ADMIN",
            type: NotificationType.ADMIN_NEW_BOOKING, 
            title: NotificationMessages.TITLE_NEW_BOOKING_ADMIN,
            body: `${NotificationMessages.BODY_NEW_BOOKING_PREFIX}${serviceName} in Zone ${resolvedZoneId}`,
            metadata: { 
                bookingId: booking.getId(),
                customerId: booking.getCustomerId(),
                zoneId: booking.getZoneId(),
            },
            clickAction: `/admin/bookings/${booking.getId()}`
        });
    }

    return createdBooking;
  }

  private sortCandidates(techs: Technician[], customerCoords: { lat: number; lng: number }): Technician[] {
    return techs.sort((a, b) => {
      const locA = a.getCurrentLocation()?.coordinates;
      const locB = b.getCurrentLocation()?.coordinates;
      if (!locA) return 1;
      if (!locB) return -1;

      const distA = this.calculateDistance(customerCoords.lat, customerCoords.lng, locA[1], locA[0]);
      const distB = this.calculateDistance(customerCoords.lat, customerCoords.lng, locB[1], locB[0]);

      if (Math.abs(distA - distB) > 0.5) return distA - distB; 
      const ratingA = a.getRatings().averageRating || 0;
      const ratingB = b.getRatings().averageRating || 0;
      return ratingB - ratingA; 
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}