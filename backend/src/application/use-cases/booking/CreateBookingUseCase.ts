import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { IZoneService } from "../../interfaces/IZoneService"; // <--- NEW IMPORT
import { ILogger } from "../../interfaces/ILogger";
import { INotificationService } from "../../services/INotificationService"; 
import { CreateBookingRequestDto } from "../../dto/booking/CreateBookingRequestDto";
import { Booking } from "../../../domain/entities/Booking";
import { Technician } from "../../../domain/entities/Technician";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";

export class CreateBookingUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _customerRepo: ICustomerRepository,
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _zoneService: IZoneService, // <--- INJECTED SERVICE
    private readonly _logger: ILogger
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

    // 3. Validation: Zone Integrity (SERVER SIDE CALCULATION)
    // We trust the Lat/Lng, not the Frontend's zoneId
    const { lat, lng } = input.location.coordinates;
    const zoneResult = await this._zoneService.checkServiceability(lat, lng);

    if (!zoneResult.isServiceable || !zoneResult.zoneId) {
       throw new Error("Sorry, we do not serve this location yet.");
    }
    
    const resolvedZoneId = zoneResult.zoneId;

    // 4. Calculate Estimates (Safe Access)
    const rawPrice = service.getBasePrice ? service.getBasePrice() : (service as any).price || 0;
    const estimatedPrice = Math.round(rawPrice * 100) / 100; 
    const deliveryFee = 0; 

    // 5. Matchmaking: Find Candidates using RESOLVED Zone
    const availableTechs = await this._technicianRepo.findAvailableInZone(
      resolvedZoneId, // <--- Use calculated ID
      input.serviceId 
    );

    // 6. Sort Candidates
    const sortedCandidates = this.sortCandidates(
      availableTechs,
      input.location.coordinates
    );

    const candidateIds = sortedCandidates.map(t => t.getId());

    // 7. Initialize Booking Entity
    const booking = new Booking({
      customerId: input.customerId,
      serviceId: input.serviceId,
      zoneId: resolvedZoneId, // <--- Use calculated ID
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
      
      payment: {
        status: "PENDING"
      },
      
      candidateIds: candidateIds,
      assignedTechAttempts: [],
      extraCharges: [],
      timeline: [],
      
      meta: {
        instructions: input.meta?.instructions
      },
      
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
        scheduledAt: input.requestedTime
      }
    });
 
    booking.setInitialSnapshots(
        { 
            name: customer.getName ? customer.getName() : (customer as any).name, 
            phone: customer.getPhone ? customer.getPhone() : (customer as any).phone, 
            avatarUrl: customer.getAvatarUrl()
        },
        { 
            name: service.getName ? service.getName() : (service as any).name, 
            categoryId: service.getCategoryId()
        }
    );

    // 9. Prepare Assignment (Flow A)
    if (candidateIds.length > 0) {
      const firstCandidateId = candidateIds[0];
      booking.addAssignmentAttempt(firstCandidateId);
    } else {
      // Logic: Even if zone is valid, if no techs are there, we fail gracefully
      booking.updateStatus("FAILED_ASSIGNMENT", "system", "No available technicians in zone");
      
      // Notify Customer immediately via Socket/Push that search failed
      await this._notificationService.send({
          recipientId: booking.getCustomerId(),
          recipientType: "CUSTOMER",
          type: NotificationType.BOOKING_FAILED,
          title: "Booking Failed 😔",
          body: "Sorry, no technicians are available in your area right now.",
          metadata: { bookingId: booking.getId() }
      });
    }

    // 10. Persist to Database
    const createdBooking = await this._bookingRepo.create(booking);

    this._logger.info(
      `Booking created: ${createdBooking.getId()} | Zone: ${resolvedZoneId} | Candidates: ${candidateIds.length}`
    );

    // 11. Trigger Real-Time Notification (Socket)
    if (candidateIds.length > 0) {
        const firstCandidateId = candidateIds[0];
        const tech = sortedCandidates[0]; 

        let distKm = "0.0";
        if (tech.getCurrentLocation()?.coordinates) {
             const dist = this.calculateDistance(
                input.location.coordinates.lat,
                input.location.coordinates.lng,
                tech.getCurrentLocation()!.coordinates[1],
                tech.getCurrentLocation()!.coordinates[0]
            );
            distKm = dist.toFixed(1);
        }

        const earnings = Math.round((estimatedPrice * 0.9) * 100) / 100;

        // A. Notify Technician
        await this._notificationService.sendBookingRequest(firstCandidateId, {
            bookingId: createdBooking.getId(),
            serviceName: service.getName ? service.getName() : "Service Request",
            earnings: earnings, 
            distance: `${distKm} km`,
            address: input.location.address,
            expiresAt: createdBooking.getAssignmentExpiresAt() || new Date(Date.now() + 45000)
        });

        // B. Notify Admin
        await this._notificationService.send({
            recipientId: "ADMIN_BROADCAST_CHANNEL", 
            recipientType: "ADMIN",
            type: NotificationType.ADMIN_NEW_BOOKING, 
            title: "New Booking Received 🚨",
            body: `New request for ${service.getName ? service.getName() : "Service"} in Zone ${resolvedZoneId}`,
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

  // ... (Helper methods sortCandidates and calculateDistance remain unchanged)
  private sortCandidates(
    techs: Technician[], 
    customerCoords: { lat: number; lng: number }
  ): Technician[] {
    return techs.sort((a, b) => {
      const locA = a.getCurrentLocation()?.coordinates;
      const locB = b.getCurrentLocation()?.coordinates;

      if (!locA) return 1;
      if (!locB) return -1;

      const distA = this.calculateDistance(
        customerCoords.lat, customerCoords.lng, 
        locA[1], locA[0]
      );
      
      const distB = this.calculateDistance(
        customerCoords.lat, customerCoords.lng, 
        locB[1], locB[0]
      );

      if (Math.abs(distA - distB) > 0.5) {
        return distA - distB; 
      }

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