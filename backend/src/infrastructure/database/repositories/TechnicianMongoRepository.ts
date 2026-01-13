import { FilterQuery } from "mongoose";
import {
  ITechnicianRepository,
  TechnicianFilterParams,
  PaginatedTechnicianResult,
  VerificationQueueFilters,
} from "../../../domain/repositories/ITechnicianRepository";
import {
  TechnicianUpdatePayload,
  ServiceRequest,
  ZoneRequest,
  BankUpdateRequest,
  PayoutStatus,
  TechnicianDocument as TechnicianVO,
} from "../../../../../shared/types/value-objects/TechnicianTypes";

import { Technician } from "../../../domain/entities/Technician";
import {
  TechnicianModel,
  TechnicianDocument,
} from "../mongoose/models/TechnicianModel";
import { ZoneModel } from "../mongoose/models/ZoneModel";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class TechnicianMongoRepository implements ITechnicianRepository {
  async create(technician: Technician): Promise<Technician> {
    const persistenceData = this.toPersistence(technician);
    const doc = await TechnicianModel.create(persistenceData);
    return this.toDomain(doc);
  }

  async update(technician: Technician): Promise<Technician> {
    const persistenceData = this.toPersistence(technician);
    const { _id, ...updateData } = persistenceData as unknown as {
      _id?: unknown;
    } & Record<string, unknown>;

    const doc = await TechnicianModel.findByIdAndUpdate(
      technician.getId(),
      updateData,
      { new: true }
    ).exec();
    if (!doc) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await TechnicianModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).exec();
    return !!result;
  }

  async findById(id: string): Promise<Technician | null> {
    const doc = await TechnicianModel.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByEmail(email: string): Promise<Technician | null> {
    const doc = await TechnicianModel.findOne({
      email: email.toLowerCase(),
      isDeleted: { $ne: true },
    }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByEmailOnly(email: string): Promise<Technician | null> {
    const doc = await TechnicianModel.findOne({
      email: email.toLowerCase(),
    }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByPhone(phone: string): Promise<Technician | null> {
    const doc = await TechnicianModel.findOne({
      phone,
      isDeleted: { $ne: true },
    }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filters: TechnicianFilterParams
  ): Promise<PaginatedTechnicianResult> {
    const query: FilterQuery<TechnicianDocument> = { isDeleted: { $ne: true } };
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }
    if (filters.status) query.verificationStatus = filters.status;
    if (filters.zoneId) query.zoneIds = filters.zoneId;
    if (filters.categoryId) query.categoryIds = filters.categoryId;
    if (filters.isOnline !== undefined)
      query["availability.isOnline"] = filters.isOnline;

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      TechnicianModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      TechnicianModel.countDocuments(query),
    ]);
    return { data: docs.map((doc) => this.toDomain(doc)), total, page, limit };
  }

  async findPendingVerification(
    filters: VerificationQueueFilters
  ): Promise<{ technicians: Technician[]; total: number }> {
    const skip = (filters.page - 1) * filters.limit;

    let query: FilterQuery<TechnicianDocument> = {};

    if (filters.type === "MAINTENANCE") {
      query = {
        $or: [
          { "serviceRequests.status": "PENDING" },
          { "zoneRequests.status": "PENDING" },
          { "bankUpdateRequests.status": "PENDING" },
        ],
      };
    } else {
      query.verificationStatus = "VERIFICATION_PENDING";
    }

    if (filters.search) {
      query.$and = [
        { ...query },
        {
          $or: [
            { name: { $regex: filters.search, $options: "i" } },
            { email: { $regex: filters.search, $options: "i" } },
            { phone: { $regex: filters.search, $options: "i" } },
          ],
        },
      ];
    }
    const sortDir = filters.sort === "desc" ? -1 : 1;
    const sortField = filters.sortBy || "updatedAt";

    const [docs, total] = await Promise.all([
      TechnicianModel.find(query)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      TechnicianModel.countDocuments(query),
    ]);
    return {
      technicians: docs.map((d) => this.toDomain(d)),
      total,
    };
  }

  async findAvailableInZone(
    zoneId: string,
    subServiceId: string,
    limit: number = 10
  ): Promise<Technician[]> {
    const query: FilterQuery<TechnicianDocument> = {
      isDeleted: { $ne: true },
      verificationStatus: "VERIFIED",
      isSuspended: false,
      "availability.isOnline": true,
      zoneIds: zoneId,
      subServiceIds: subServiceId,
    };
    const docs = await TechnicianModel.find(query).limit(limit).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async updateTechnician(
    id: string,
    payload: TechnicianUpdatePayload
  ): Promise<void> {
    await TechnicianModel.findByIdAndUpdate(id, { $set: payload }).exec();
  }

  async toggleBlockTechnician(
    id: string,
    isSuspended: boolean,
    reason?: string
  ): Promise<void> {
    const update = { isSuspended, suspendReason: reason || "" };
    await TechnicianModel.findByIdAndUpdate(id, { $set: update }).exec();
  }

  async verifyZoneAccess(
    zoneIds: string[],
    lat: number,
    lng: number
  ): Promise<boolean> {
    const count = await ZoneModel.countDocuments({
      _id: { $in: zoneIds },
      isActive: true,
      isDeleted: false,
      location: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        },
      },
    });
    return count > 0;
  }

  async updateOnlineStatus(
    id: string,
    isOnline: boolean,
    location?: { lat: number; lng: number }
  ): Promise<void> {
    const update: Record<string, unknown> = {
      "availability.isOnline": isOnline,
      "availability.lastSeen": new Date(),
    };
    if (location) {
      update.currentLocation = {
        type: "Point",
        coordinates: [location.lng, location.lat],
        lastUpdated: new Date(),
      };
    }
    await TechnicianModel.findByIdAndUpdate(id, { $set: update }).exec();
  }

  async addServiceRequest(id: string, request: ServiceRequest): Promise<void> {
    await TechnicianModel.findByIdAndUpdate(id, {
      $push: { serviceRequests: request },
    }).exec();
  }

  async addZoneRequest(id: string, request: ZoneRequest): Promise<void> {
    await TechnicianModel.findByIdAndUpdate(id, {
      $push: { zoneRequests: request },
    }).exec();
  }

  async addBankUpdateRequest(
    id: string,
    request: BankUpdateRequest
  ): Promise<void> {
    await TechnicianModel.findByIdAndUpdate(id, {
      $push: { bankUpdateRequests: request },
      $set: { payoutStatus: "ON_HOLD" },
    }).exec();
  }

  async updatePayoutStatus(id: string, status: PayoutStatus): Promise<void> {
    await TechnicianModel.findByIdAndUpdate(id, {
      $set: { payoutStatus: status },
    }).exec();
  }
async dismissRequest(technicianId: string, requestId: string): Promise<void> { 
  const result = await TechnicianModel.updateOne(
    { _id: technicianId },
    {
      $set: {
        "serviceRequests.$[elem].isDismissed": true,
        "zoneRequests.$[elem].isDismissed": true,
        "bankUpdateRequests.$[elem].isDismissed": true
      }
    },
    {
      arrayFilters: [{ "elem._id": requestId }] 
    }
  ).exec();

  if (result.matchedCount === 0) {
    throw new Error(ErrorMessages.REQUEST_NOT_FOUND);
  }
}

  // --- Internal Mappers ---
  private toDomain(doc: TechnicianDocument): Technician {
    if (!doc) throw new Error("Technician document is undefined");

    const hasCoordinates =
      doc.currentLocation &&
      doc.currentLocation.coordinates &&
      Array.isArray(doc.currentLocation.coordinates) &&
      doc.currentLocation.coordinates.length >= 2;

    const documents: TechnicianVO[] = (doc.documents || []).reduce<
      TechnicianVO[]
    >((acc, d: any) => {
      if (d && d.type && d.fileUrl) {
        acc.push({
          type: d.type,
          fileUrl: d.fileUrl,
          fileName: d.fileName || "",
          status: d.status || "PENDING",
          rejectionReason: d.rejectionReason,
          uploadedAt: d.uploadedAt,
        });
      }
      return acc;
    }, []);

    const serviceRequests: ServiceRequest[] = (doc.serviceRequests || []).map(
      (r: any) => ({
        id: r._id ? r._id.toString() : "",
        serviceId: r.serviceId,
        categoryId: r.categoryId,
        action: r.action,
        proofUrl: r.proofUrl,
        status: r.status,
        adminComments: r.adminComments,
        requestedAt: r.requestedAt,
        resolvedAt: r.resolvedAt,
        isDismissed: !!r.isDismissed,
        isArchived: !!r.isArchived,
      })
    );

    const zoneRequests: ZoneRequest[] = (doc.zoneRequests || []).map(
      (r: any) => ({
        id: r._id ? r._id.toString() : "",
        currentZoneId: r.currentZoneId,
        requestedZoneId: r.requestedZoneId,
        status: r.status,
        adminComments: r.adminComments,
        requestedAt: r.requestedAt,
        resolvedAt: r.resolvedAt,
        isDismissed: !!r.isDismissed,
        isArchived: !!r.isArchived,
      })
    );

    const bankUpdateRequests: BankUpdateRequest[] = (
      doc.bankUpdateRequests || []
    ).map((r: any) => ({
      id: r._id ? r._id.toString() : "",
      accountHolderName: r.accountHolderName,
      accountNumber: r.accountNumber,
      bankName: r.bankName,
      ifscCode: r.ifscCode,
      upiId: r.upiId,
      proofUrl: r.proofUrl,
      status: r.status,
      adminComments: r.adminComments,
      requestedAt: r.requestedAt,
      resolvedAt: r.resolvedAt,
      isDismissed: !!r.isDismissed,
      isArchived: !!r.isArchived,
    }));

    return new Technician({
      id: doc._id.toString(),
      name: doc.name || "",
      email: doc.email || "",
      phone: doc.phone || "",
      password: doc.password || "",
      onboardingStep: doc.onboardingStep || 1,
      experienceSummary: doc.experienceSummary || "",
      avatarUrl: doc.avatarUrl,
      bio: doc.bio,
      categoryIds: doc.categoryIds || [],
      subServiceIds: doc.subServiceIds || [],
      zoneIds: doc.zoneIds || [],
      serviceRequests,
      zoneRequests,
      bankUpdateRequests,
      payoutStatus: (doc.payoutStatus as PayoutStatus) || "ACTIVE",
      documents: documents,
      bankDetails: doc.bankDetails,
      walletBalance: doc.walletBalance || {
        currentBalance: 0,
        frozenAmount: 0,
        currency: "INR",
      },
      availability: doc.availability || { isOnline: false, isOnJob: false },
      ratings: doc.ratings || { averageRating: 0, totalReviews: 0 },
      verificationStatus: doc.verificationStatus || "PENDING",
      verificationReason: doc.verificationReason,
      isSuspended: !!doc.isSuspended,
      suspendReason: doc.suspendReason,
      portfolioUrls: doc.portfolioUrls || [],
      deviceToken: doc.deviceToken,
      emergencyContact: doc.emergencyContact,
      currentLocation: hasCoordinates
        ? {
            type: "Point",
            coordinates: [
              doc.currentLocation!.coordinates[0],
              doc.currentLocation!.coordinates[1],
            ],
            lastUpdated: doc.currentLocation!.lastUpdated,
          }
        : undefined,
      isOnline: doc.availability?.isOnline || false,
      isDeleted: !!doc.isDeleted,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
  }

  private toPersistence(entity: Technician): Partial<TechnicianDocument> {
    const props = entity.toProps();

    const persistenceDocuments = props.documents.map((d: TechnicianVO) => ({
      type: d.type,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      status: d.status as
        | "PENDING"
        | "VERIFICATION_PENDING"
        | "APPROVED"
        | "REJECTED",
      rejectionReason: d.rejectionReason,
      uploadedAt: d.uploadedAt || new Date(),
    }));

    const persistenceServiceRequests = (props.serviceRequests || []).map(
      (r: ServiceRequest) => ({
        _id: r.id,
        serviceId: r.serviceId,
        categoryId: r.categoryId,
        action: r.action,
        proofUrl: r.proofUrl,
        status: r.status,
        adminComments: r.adminComments,
        requestedAt: r.requestedAt,
        resolvedAt: r.resolvedAt,
        isDismissed: !!r.isDismissed,
        isArchived: !!r.isArchived,
      })
    );

    const persistenceZoneRequests = (props.zoneRequests || []).map(
      (r: ZoneRequest) => ({
        currentZoneId: r.currentZoneId,
        requestedZoneId: r.requestedZoneId,
        status: r.status,
        adminComments: r.adminComments,
        requestedAt: r.requestedAt,
        resolvedAt: r.resolvedAt,
        isDismissed: !!r.isDismissed,
        isArchived: !!r.isArchived,
      })
    );

    const persistenceBankRequests = (props.bankUpdateRequests || []).map(
      (r: BankUpdateRequest) => ({
        accountHolderName: r.accountHolderName,
        accountNumber: r.accountNumber,
        bankName: r.bankName,
        ifscCode: r.ifscCode,
        upiId: r.upiId,
        proofUrl: r.proofUrl,
        status: r.status,
        adminComments: r.adminComments,
        requestedAt: r.requestedAt,
        resolvedAt: r.resolvedAt,
        isDismissed: !!r.isDismissed,
        isArchived: !!r.isArchived,
      })
    );

    return {
      name: props.name,
      email: props.email,
      phone: props.phone,
      password: props.password,
      onboardingStep: props.onboardingStep,
      experienceSummary: props.experienceSummary,
      avatarUrl: props.avatarUrl,
      bio: props.bio,
      categoryIds: props.categoryIds,
      subServiceIds: props.subServiceIds,
      zoneIds: props.zoneIds,
      serviceRequests: persistenceServiceRequests as any,
      zoneRequests: persistenceZoneRequests as any,
      bankUpdateRequests: persistenceBankRequests as any,
      payoutStatus: props.payoutStatus,
      documents: persistenceDocuments as any,
      bankDetails: props.bankDetails,
      walletBalance: props.walletBalance,
      availability: props.availability,
      ratings: props.ratings,
      verificationStatus: props.verificationStatus as
        | "PENDING"
        | "VERIFICATION_PENDING"
        | "VERIFIED"
        | "REJECTED",
      verificationReason: props.verificationReason,
      isSuspended: props.isSuspended,
      suspendReason: props.suspendReason,
      portfolioUrls: props.portfolioUrls,
      deviceToken: props.deviceToken,
      emergencyContact: props.emergencyContact,
      currentLocation: props.currentLocation
        ? {
            type: "Point",
            coordinates: props.currentLocation.coordinates,
            lastUpdated: props.currentLocation.lastUpdated,
          }
        : undefined,
      isDeleted: props.isDeleted,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
