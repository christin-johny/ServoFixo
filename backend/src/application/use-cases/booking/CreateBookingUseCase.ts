import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../interfaces/ILogger";
import { INotificationService } from "../../services/INotificationService"; 
import { CreateBookingRequestDto } from "../../dto/booking/CreateBookingRequestDto";
import { Booking } from "../../../domain/entities/Booking";
import { Technician } from "../../../domain/entities/Technician";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class CreateBookingUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _customerRepo: ICustomerRepository,
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService, // Injected Dependency
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

    // 3. Validation: Zone Integrity
    if (customer.getDefaultZoneId() !== input.zoneId) {
      this._logger.warn(`Zone mismatch for customer ${input.customerId}. Proceeding.`);
    }

    // 4. Calculate Estimates
const rawPrice = service.getBasePrice(); 
    
    const estimatedPrice = Math.round(rawPrice * 100) / 100; 
    const deliveryFee = 0;

    // 5. Matchmaking: Find Candidates
    // We pass the SERVICE ID to find techs who specifically perform this service.
    const availableTechs = await this._technicianRepo.findAvailableInZone(
      input.zoneId,
      input.serviceId 
    );

    // 6. Sort Candidates (The "Brain": Distance > Rating)
    const sortedCandidates = this.sortCandidates(
      availableTechs,
      input.location.coordinates
    );

    const candidateIds = sortedCandidates.map(t => t.getId());

    // 7. Initialize Booking Entity
    const booking = new Booking({
      customerId: input.customerId,
      serviceId: input.serviceId,
      zoneId: input.zoneId,
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

    // 8. Prepare Assignment (Flow A: Instant Attempt)
    if (candidateIds.length > 0) {
      const firstCandidateId = candidateIds[0];
      // This sets status to ASSIGNED_PENDING and starts the 45s timer in the entity
      booking.addAssignmentAttempt(firstCandidateId);
    } else {
      // Flow C: Total Failure (No techs online)
      booking.updateStatus("FAILED_ASSIGNMENT", "system", "No available technicians in zone");
    }

    // 9. Persist to Database (We save first to generate the Booking ID)
    const createdBooking = await this._bookingRepo.create(booking);

    this._logger.info(
      `Booking created: ${createdBooking.getId()} | Candidates: ${candidateIds.length}`
    );

    // 10. Trigger Real-Time Notification (Socket)
    // We do this AFTER creating the booking so the ID is valid for the payload
    if (candidateIds.length > 0) {
        const firstCandidateId = candidateIds[0];
        const tech = sortedCandidates[0]; // Get the tech entity for location calc if needed

        // Calculate actual distance for the notification
        const distKm = this.calculateDistance(
            input.location.coordinates.lat,
            input.location.coordinates.lng,
            tech.getCurrentLocation()?.coordinates[1] || 0, // Lat
            tech.getCurrentLocation()?.coordinates[0] || 0  // Lng
        ).toFixed(1);

        // Fire the Popup Event
        await this._notificationService.sendBookingRequest(firstCandidateId, {
            bookingId: createdBooking.getId(),
            serviceName: service.getName(),
             
            earnings: Math.round((estimatedPrice * 0.9) * 100) / 100, 
            
            distance: `${distKm} km`,
            address: input.location.address,
            expiresAt: createdBooking.getAssignmentExpiresAt() || new Date(Date.now() + 45000)
        });
    }

    return createdBooking;
  }
 
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

  /**
   * Haversine formula for distance in KM
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of earth in km
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