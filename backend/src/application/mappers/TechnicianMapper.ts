import { Technician } from "../../domain/entities/Technician";
import { TechnicianResponseDto } from "../../application/dto/technician/TechnicianResponseDto";
import { VerificationStatus } from "../../../../shared/types/value-objects/TechnicianTypes";
import { TechnicianQueueItemDto } from "../dto/technician/TechnicianQueueDto";
import { AdminTechnicianProfileDto } from "../dto/technician/TechnicianVerificationDtos";

export class TechnicianMapper {
  static toDomain(raw: any): Technician {
    if (!raw) throw new Error("Technician data is null/undefined");

    const documents = Array.isArray(raw.documents)
      ? raw.documents.map((d: any) => ({
          type: d.type,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          status: d.status,
          rejectionReason: d.rejectionReason,
          uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : new Date(),
        }))
      : [];

    return new Technician({
      id: raw._id ? raw._id.toString() : raw.id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      password: raw.password,

      onboardingStep: raw.onboardingStep || 1,
      experienceSummary: raw.experienceSummary || "",

      avatarUrl: raw.avatarUrl,
      bio: raw.bio,

      categoryIds: raw.categoryIds
        ? raw.categoryIds.map((id: any) => id.toString())
        : [],
      subServiceIds: raw.subServiceIds
        ? raw.subServiceIds.map((id: any) => id.toString())
        : [],
      zoneIds: raw.zoneIds ? raw.zoneIds.map((id: any) => id.toString()) : [],

      documents: documents,
      bankDetails: raw.bankDetails,

      walletBalance: raw.walletBalance || {
        currentBalance: 0,
        frozenAmount: 0,
        currency: "INR",
      },
      availability: raw.availability || { isOnline: false },
      ratings: raw.ratings || { averageRating: 0, totalReviews: 0 },

      verificationStatus: raw.verificationStatus || "PENDING",
      verificationReason: raw.verificationReason,

      isSuspended: !!raw.isSuspended,
      isDeleted: !!raw.isDeleted,
      suspendReason: raw.suspendReason,

      portfolioUrls: raw.portfolioUrls || [],
      deviceToken: raw.deviceToken,

      currentLocation:
        raw.currentLocation && raw.currentLocation.coordinates
          ? {
              type: "Point",
              coordinates: raw.currentLocation.coordinates,
              lastUpdated: raw.currentLocation.lastUpdated,
            }
          : undefined,

      emergencyContact: raw.emergencyContact,

      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
    });
  }

  static toResponse(entity: Technician): TechnicianResponseDto {
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

      documents: entity.getDocuments(),
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
    };
  }

  static toAdminProfile(entity: Technician): AdminTechnicianProfileDto {
    const documents = entity.getDocuments();
    const bank = entity.getBankDetails();

    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: entity.getAvatarUrl(),

      experienceSummary: entity.getExperienceSummary(),
      zoneIds: entity.getZoneIds(),
      categoryIds: entity.getCategoryIds(),
      subServiceIds: entity.getSubServiceIds(),

      documents: Array.isArray(documents)
        ? documents.map((d: any) => ({
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
