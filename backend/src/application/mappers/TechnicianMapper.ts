import { Technician } from "../../domain/entities/Technician";
import { TechnicianResponseDto } from "../../application/dto/technician/TechnicianResponseDto";
import {
  VerificationStatus
} from "../../../../shared/types/value-objects/TechnicianTypes";
import { TechnicianQueueItemDto } from "../dto/technician/TechnicianQueueDto";
import { AdminTechnicianProfileDto } from "../dto/technician/TechnicianVerificationDtos";

export class TechnicianMapper {
  /**
   * Maps raw database/DTO data to the Domain Entity.
   * Includes all fields from your original file to ensure no data loss.
   */
  static toDomain(raw: any): Technician {
    if (!raw) throw new Error("Technician data is null/undefined");
    
    return new Technician({
        id: raw.id || raw._id?.toString(),
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        password: raw.password,
        onboardingStep: raw.onboardingStep || 1,
        experienceSummary: raw.experienceSummary || "",
        avatarUrl: raw.avatarUrl,
        bio: raw.bio,
        categoryIds: raw.categoryIds || [],
        subServiceIds: raw.subServiceIds || [],
        zoneIds: raw.zoneIds || [],
        
        // ✅ Requests Arrays
        serviceRequests: raw.serviceRequests || [],
        zoneRequests: raw.zoneRequests || [],
        bankUpdateRequests: raw.bankUpdateRequests || [],
        payoutStatus: raw.payoutStatus || "ACTIVE",
        
        documents: raw.documents || [],
        bankDetails: raw.bankDetails,
        walletBalance: raw.walletBalance,
        availability: raw.availability,
        ratings: raw.ratings,
        verificationStatus: raw.verificationStatus,
        verificationReason: raw.verificationReason,
        isSuspended: !!raw.isSuspended,
        suspendReason: raw.suspendReason,
        portfolioUrls: raw.portfolioUrls || [],
        deviceToken: raw.deviceToken,
        emergencyContact: raw.emergencyContact,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt
    });
  }

  /**
   * Maps Domain Entity to the standard Response DO.
   */
  static toResponse(entity: Technician): TechnicianResponseDto {
    const mappedDocuments = entity.getDocuments().map((doc) => ({
      type: doc.type,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      status: doc.status || "PENDING",
      rejectionReason: doc.rejectionReason,
      uploadedAt: doc.uploadedAt || new Date(),
    }));

    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: entity.getAvatarUrl(),
      bio: entity.getBio(),
      onboardingStep: entity.getOnboardingStep(),
      experienceSummary: entity.getExperienceSummary(),
      categoryIds: entity.getCategoryIds(),
      subServiceIds: entity.getSubServiceIds(),
      zoneIds: entity.getZoneIds(),
      serviceRequests: entity.getServiceRequests(),
      zoneRequests: entity.getZoneRequests(),
      bankUpdateRequests: entity.getBankUpdateRequests(),
      payoutStatus: entity.getPayoutStatus(),
      documents: mappedDocuments,
      bankDetails: entity.getBankDetails(),
      walletBalance: entity.getWalletBalance(),
      availability: entity.getAvailability(),
      ratings: entity.getRatings(),
      verificationStatus: entity.getVerificationStatus() as VerificationStatus,
      verificationReason: entity.getVerificationReason(),
      isSuspended: entity.getIsSuspended(),
      suspendReason: entity.getSuspendReason(),
      isDeleted: entity.getIsDeleted(),
      portfolioUrls: entity.getPortfolioUrls(),
      deviceToken: entity.getDeviceToken(),
      currentLocation: entity.getCurrentLocation(),
      emergencyContact: entity.getEmergencyContact(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }

  /**
   * Maps Entity to Queue Item with calculated Admin Dashboard flags.
   */
  static toQueueItem(entity: Technician): TechnicianQueueItemDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: entity.getAvatarUrl(),
      status: entity.getVerificationStatus(),
      submittedAt: entity.getUpdatedAt(),
      isSuspended: entity.getIsSuspended(),

      // ✅ Flags for the Maintenance Hub
      hasPendingServiceRequests: entity.getServiceRequests().some(r => r.status === "PENDING"),
      hasPendingZoneRequests: entity.getZoneRequests().some(r => r.status === "PENDING"),
      hasPendingBankRequests: entity.getBankUpdateRequests().some(r => r.status === "PENDING"),
    };
  }

  /**
   * Maps Entity to the Detailed Admin Profile DTO.
   */
  static toAdminProfile(entity: Technician): AdminTechnicianProfileDto {
    const documents = entity.getDocuments();
    const bank = entity.getBankDetails();

    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: entity.getAvatarUrl(),
      bio: entity.getBio(),
      experienceSummary: entity.getExperienceSummary(),
      zoneIds: entity.getZoneIds(),
      categoryIds: entity.getCategoryIds(),
      subServiceIds: entity.getSubServiceIds(),
      zoneNames: [],
      categoryNames: [],
      subServiceNames: [], 

      // ✅ Maps updated request arrays including categoryId
      serviceRequests: entity.getServiceRequests(),
      zoneRequests: entity.getZoneRequests(),
      bankUpdateRequests: entity.getBankUpdateRequests(),
      payoutStatus: entity.getPayoutStatus(),

      documents: Array.isArray(documents)
        ? documents.map((d) => ({
            type: d.type,
            fileUrl: d.fileUrl,
            fileName: d.fileName,
            status: d.status as "PENDING" | "APPROVED" | "REJECTED",
            rejectionReason: d.rejectionReason,
          }))
        : [],

      bankDetails: bank
        ? {
            accountHolderName: bank.accountHolderName,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
            bankName: bank.bankName,
          }
        : {
            accountHolderName: "",
            accountNumber: "",
            ifscCode: "",
            bankName: "",
          },

      verificationStatus: entity.getVerificationStatus(),
      submittedAt: entity.getUpdatedAt(),
    };
  }
}