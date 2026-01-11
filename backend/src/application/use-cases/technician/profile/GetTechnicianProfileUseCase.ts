import { IUseCase } from "../../../interfaces/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IServiceCategoryRepository } from "../../../../domain/repositories/IServiceCategoryRepository";
import { IServiceItemRepository } from "../../../../domain/repositories/IServiceItemRepository";
import { IZoneRepository } from "../../../../domain/repositories/IZoneRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { TechnicianResponseDto } from "../../../dto/technician/TechnicianResponseDto";

export class GetTechnicianProfileUseCase
  implements IUseCase<TechnicianResponseDto | null, [string]>
{
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _categoryRepository: IServiceCategoryRepository,
    private readonly _serviceRepository: IServiceItemRepository,
    private readonly _zoneRepository: IZoneRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string): Promise<TechnicianResponseDto | null> {
    const tech = await this._technicianRepository.findById(technicianId);
    
    if (!tech) {
      this._logger.warn(LogEvents.TECH_NOT_FOUND, { technicianId });
      return null;
    }

    // Hydrate Relations (Parallel Fetching)
    const [categories, subServices, zones] = await Promise.all([
      Promise.all(tech.getCategoryIds().map(id => this._categoryRepository.findById(id))),
      Promise.all(tech.getSubServiceIds().map(id => this._serviceRepository.findById(id))),
      Promise.all(tech.getZoneIds().map(id => this._zoneRepository.findById(id)))
    ]);

    // Map to DTO
    return {
      id: tech.getId(),
      name: tech.getName(),
      email: tech.getEmail(),
      phone: tech.getPhone(),
      avatarUrl: tech.getAvatarUrl(),
      bio: tech.getBio(),
      
      onboardingStep: tech.getOnboardingStep(),
      experienceSummary: tech.getExperienceSummary(),

      categoryIds: tech.getCategoryIds(),
      subServiceIds: tech.getSubServiceIds(),
      zoneIds: tech.getZoneIds(),

      // ✅ FIXED: Call methods directly (No '?' checks)
      categories: categories
        .filter((c) => c !== null)
        .map((c) => ({
          id: c!.getId(),
          name: c!.getName(),
          iconUrl: c!.getIconUrl()
        })),

      subServices: subServices
        .filter((s) => s !== null)
        .map((s) => ({
          id: s!.getId(),
          name: s!.getName(),
          categoryId: s!.getCategoryId()
        })),

      serviceZones: zones
        .filter((z) => z !== null)
        .map((z) => ({
          id: z!.getId(),
          name: z!.getName()
        })),

      documents: tech.getDocuments().map((doc) => ({
        type: doc.type,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        status: doc.status || "PENDING",
        rejectionReason: doc.rejectionReason,
        uploadedAt: new Date() // Fallback if not tracked in entity
      })),

      bankDetails: tech.getBankDetails() ? {
        accountHolderName: tech.getBankDetails()!.accountHolderName,
        accountNumber: tech.getBankDetails()!.accountNumber,
        bankName: tech.getBankDetails()!.bankName,
        ifscCode: tech.getBankDetails()!.ifscCode,
      } : undefined,

      walletBalance: tech.getWalletBalance(),
      
      availability: {
        isOnline: tech.getAvailability().isOnline,
        lastSeen: (tech.getAvailability() as any).lastSeen,
        schedule: (tech.getAvailability() as any).schedule
      },

      ratings: {
        averageRating: tech.getRatings().averageRating,
        totalReviews: tech.getRatings().totalReviews
      },

      verificationStatus: tech.getVerificationStatus(),
      verificationReason: tech.getVerificationReason(),
      isSuspended: tech.getIsSuspended(),
      suspendReason: tech.getSuspendReason(),
      isDeleted: tech.getIsDeleted(),
      portfolioUrls: tech.getPortfolioUrls(),
      deviceToken: tech.getDeviceToken(),
      
      currentLocation: tech.getCurrentLocation() ? {
          type: "Point",
          coordinates: tech.getCurrentLocation()!.coordinates,
          lastUpdated: tech.getCurrentLocation()!.lastUpdated
      } : undefined,

      emergencyContact: tech.getEmergencyContact(),

      createdAt: tech.getCreatedAt(),
      updatedAt: tech.getUpdatedAt()
    };
  }
}