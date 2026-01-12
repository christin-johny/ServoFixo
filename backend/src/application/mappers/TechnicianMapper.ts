import { Technician } from "../../domain/entities/Technician";
import { TechnicianResponseDto } from "../../application/dto/technician/TechnicianResponseDto";
import {
  VerificationStatus,
  TechnicianDocument,
  ServiceRequest,
  ZoneRequest,
  BankUpdateRequest
} from "../../../../shared/types/value-objects/TechnicianTypes";
import { TechnicianQueueItemDto } from "../dto/technician/TechnicianQueueDto";
import { AdminTechnicianProfileDto } from "../dto/technician/TechnicianVerificationDtos";

export class TechnicianMapper {
  static toDomain(raw: any): Technician {
    // This is handled by Repository now, but keeping for reference if needed elsewhere
    if (!raw) throw new Error("Technician data is null/undefined");
    // (Logic duplicates Repository, safe to keep as utility)
    return new Technician({
        // ... (Keep existing implementation or delegate to repo)
        // For safety, assume Repo logic is primary.
        // If this method is used by tests/other services, ensure it mirrors Repo logic.
        id: raw.id || raw._id?.toString(),
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        password: raw.password,
        // ... other fields
        // Ensure to include:
        serviceRequests: raw.serviceRequests || [],
        zoneRequests: raw.zoneRequests || [],
        bankUpdateRequests: raw.bankUpdateRequests || [],
        payoutStatus: raw.payoutStatus || "ACTIVE",
        // ...
        onboardingStep: raw.onboardingStep || 1,
        experienceSummary: raw.experienceSummary || "",
        categoryIds: raw.categoryIds || [],
        subServiceIds: raw.subServiceIds || [],
        zoneIds: raw.zoneIds || [],
        documents: raw.documents || [],
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
 
      // ✅ Technician Side Data
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

      // ✅ ADDED: Admin Dashboard Flags (Calculated)
      hasPendingServiceRequests: entity.getServiceRequests().some(r => r.status === "PENDING"),
      hasPendingZoneRequests: entity.getZoneRequests().some(r => r.status === "PENDING"),
      hasPendingBankRequests: entity.getBankUpdateRequests().some(r => r.status === "PENDING"),
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
      bio: entity.getBio(), // ✅

      experienceSummary: entity.getExperienceSummary(),
       
      zoneIds: entity.getZoneIds(),
      categoryIds: entity.getCategoryIds(),
      subServiceIds: entity.getSubServiceIds(),
 
      zoneNames: [],
      categoryNames: [],
      subServiceNames: [], 

      // ✅ Admin Requests Arrays
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