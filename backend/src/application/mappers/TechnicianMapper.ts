import { Technician } from "../../domain/entities/Technician";
import { TechnicianResponseDto } from "../../application/dto/technician/TechnicianResponseDto";
import { VerificationStatus } from "../../domain/value-objects/TechnicianTypes";
import { TechnicianQueueItemDto } from "../dto/technician/TechnicianQueueDto";
import { AdminTechnicianProfileDto } from "../dto/technician/TechnicianVerificationDtos";
import { S3UrlHelper } from "../../infrastructure/storage/S3UrlHelper"; //

export class TechnicianMapper {
 
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
        avatarUrl: raw.avatarUrl, // This is a Key
        bio: raw.bio,
        categoryIds: raw.categoryIds || [],
        subServiceIds: raw.subServiceIds || [],
        zoneIds: raw.zoneIds || [],
          
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
   * Maps Domain Entity to the standard Response DTO.
   * ASYNC: Resolves public paths and signs private documents.
   */
  static async toResponse(entity: Technician): Promise<TechnicianResponseDto> {
    // Public Avatar
    const resolvedAvatar = S3UrlHelper.getFullUrl(entity.getAvatarUrl());

    // Private Documents (Signed)
    const mappedDocuments = await Promise.all(
      entity.getDocuments().map(async (doc) => ({
        type: doc.type,
        fileUrl: await S3UrlHelper.getPrivateUrl(doc.fileUrl), //
        fileName: doc.fileName,
        status: doc.status || "PENDING",
        rejectionReason: doc.rejectionReason,
        uploadedAt: doc.uploadedAt || new Date(),
      }))
    );

    // Private Request Proofs (Signed)
    const mappedServiceRequests = await Promise.all(
      entity.getServiceRequests().map(async (req) => ({
        ...req,
        proofUrl: req.proofUrl ? await S3UrlHelper.getPrivateUrl(req.proofUrl) : undefined
      }))
    );

    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: resolvedAvatar,
      bio: entity.getBio(),
      onboardingStep: entity.getOnboardingStep(),
      experienceSummary: entity.getExperienceSummary(),
      categoryIds: entity.getCategoryIds(),
      subServiceIds: entity.getSubServiceIds(),
      zoneIds: entity.getZoneIds(),
      serviceRequests: mappedServiceRequests,
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
   * Maps Entity to Queue Item for Admin Dashboard.
   */
  static toQueueItem(entity: Technician): TechnicianQueueItemDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: S3UrlHelper.getFullUrl(entity.getAvatarUrl()), //
      status: entity.getVerificationStatus(),
      submittedAt: entity.getUpdatedAt(),
      isSuspended: entity.getIsSuspended(),
 
      hasPendingServiceRequests: entity.getServiceRequests().some(r => r.status === "PENDING"),
      hasPendingZoneRequests: entity.getZoneRequests().some(r => r.status === "PENDING"),
      hasPendingBankRequests: entity.getBankUpdateRequests().some(r => r.status === "PENDING"),
    };
  }

  /**
   * Maps Entity to the Detailed Admin Profile DTO with Signed URLs.
   */
  static async toAdminProfile(entity: Technician): Promise<AdminTechnicianProfileDto> {
    const documents = entity.getDocuments();

    return {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail(),
      phone: entity.getPhone(),
      avatarUrl: S3UrlHelper.getFullUrl(entity.getAvatarUrl()),
      bio: entity.getBio(),
      experienceSummary: entity.getExperienceSummary(),
      zoneIds: entity.getZoneIds(),
      categoryIds: entity.getCategoryIds(),
      subServiceIds: entity.getSubServiceIds(),
      isSuspended: entity.getIsSuspended(),
      suspendReason: entity.getSuspendReason(),
      zoneNames: [],
      categoryNames: [],
      subServiceNames: [], 
 
      serviceRequests: await Promise.all(entity.getServiceRequests().map(async r => ({
        ...r,
        proofUrl: r.proofUrl ? await S3UrlHelper.getPrivateUrl(r.proofUrl) : undefined
      }))),
      zoneRequests: entity.getZoneRequests(),
      bankUpdateRequests: await Promise.all(entity.getBankUpdateRequests().map(async r => ({
        ...r,
        proofUrl: r.proofUrl ? await S3UrlHelper.getPrivateUrl(r.proofUrl) : undefined
      }))),
      payoutStatus: entity.getPayoutStatus(),

      documents: await Promise.all(documents.map(async (d) => ({
        type: d.type,
        fileUrl: await S3UrlHelper.getPrivateUrl(d.fileUrl),
        fileName: d.fileName,
        status: d.status as "PENDING" | "APPROVED" | "REJECTED",
        rejectionReason: d.rejectionReason,
      }))),

      bankDetails: entity.getBankDetails() || {
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