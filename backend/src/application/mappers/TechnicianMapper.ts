import { Technician } from "../../domain/entities/Technician";
import { CreateTechnicianDto } from "../dto/technician/CreateTechnicianDto";
import { TechnicianResponseDto } from "../dto/technician/TechnicianResponseDto";

export class TechnicianMapper {

  // DTO (Registration) -> Domain Entity
  static toDomain(
    dto: CreateTechnicianDto, 
    id: string = "", 
    hashedPassword?: string
  ): Technician {
    return new Technician({
      id: id,
      name: dto.name,
      email: dto.email, // Validation should happen in UseCase/Middleware
      phone: dto.phone,
      password: hashedPassword || dto.password, 
      
      // Defaults for new registration
      avatarUrl: undefined,
      bio: undefined,
      experienceSummary: undefined,

      categoryIds: [],
      subServiceIds: [],
      zoneIds: dto.zoneIds || [], // Allow setting zone if passed, else empty
      
      documents: [],
      bankDetails: undefined,
      
      // ✅ Default Financial State
      walletBalance: { 
        currentBalance: 0, 
        frozenAmount: 0, 
        currency: "INR" 
      },
      
      // ✅ Default Availability State
      availability: { 
        isOnline: false 
      },
      
      // ✅ Default Ratings
      ratings: { 
        averageRating: 0, 
        totalReviews: 0 
      },

      // ✅ Default Compliance State
      verificationStatus: 'PENDING',
      verificationReason: undefined,
      isSuspended: false,
      suspendReason: undefined,

      portfolioUrls: [],
      deviceToken: undefined,
      currentLocation: undefined,
      emergencyContact: undefined,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Domain Entity -> Response DTO
  static toResponse(entity: Technician): TechnicianResponseDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: entity.getAvatarUrl(),
      bio: entity.getBio(),
      experienceSummary: entity.getExperienceSummary(),

      categoryIds: entity.getCategoryIds(),
      subServiceIds: entity.getSubServiceIds(),
      zoneIds: entity.getZoneIds(),

      documents: entity.getDocuments(),
      bankDetails: entity.getBankDetails(),
      walletBalance: entity.getWalletBalance(),
      availability: entity.getAvailability(),
      ratings: entity.getRatings(),

      verificationStatus: entity.getVerificationStatus(),
      verificationReason: entity.getVerificationReason(),
      isSuspended: entity.getIsSuspended(),
      suspendReason: entity.getSuspendReason(),

      portfolioUrls: entity.getPortfolioUrls(),
      deviceToken: entity.getDeviceToken(),
      currentLocation: entity.getCurrentLocation(),
      emergencyContact: entity.getEmergencyContact(),

      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}