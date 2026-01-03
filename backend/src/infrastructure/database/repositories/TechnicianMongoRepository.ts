import { FilterQuery } from "mongoose";
import {
  ITechnicianRepository,
  TechnicianFilterParams,
  PaginatedTechnicianResult,
} from "../../../domain/repositories/ITechnicianRepository";
import { Technician } from "../../../domain/entities/Technician";
import {
  TechnicianModel,
  TechnicianDocument,
} from "../mongoose/models/TechnicianModel";

export class TechnicianMongoRepository implements ITechnicianRepository {
  
  async create(technician: Technician): Promise<Technician> {
    const persistenceData = this.toPersistence(technician);
    const doc = await TechnicianModel.create(persistenceData);
    return this.toDomain(doc);
  }

  async update(technician: Technician): Promise<Technician> {
    const persistenceData = this.toPersistence(technician);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { _id, ...updateData } = persistenceData as any;

    const doc = await TechnicianModel.findByIdAndUpdate(
      technician.getId(),
      updateData,
      { new: true }
    ).exec();

    if (!doc) throw new Error("Technician not found for update");
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
    if (filters.isOnline !== undefined) query["availability.isOnline"] = filters.isOnline;

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      TechnicianModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      TechnicianModel.countDocuments(query),
    ]);

    return {
      data: docs.map((doc) => this.toDomain(doc)),
      total,
      page,
      limit,
    };
  }

  async findAvailableInZone(
    zoneId: string,
    subServiceId: string,
    limit: number = 10
  ): Promise<Technician[]> {
    const query = {
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

  // --- Internal Mappers ---

  private toDomain(doc: TechnicianDocument): Technician {
    // Check coordinates existence safely
    const hasCoordinates = 
      doc.currentLocation && 
      doc.currentLocation.coordinates && 
      Array.isArray(doc.currentLocation.coordinates) &&
      doc.currentLocation.coordinates.length >= 2;
    
    // Map documents safely
    const mappedDocuments = Array.isArray(doc.documents) 
      ? doc.documents.map(d => ({
          type: d.type,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          status: d.status,
          rejectionReason: d.rejectionReason,
          uploadedAt: d.uploadedAt
        }))
      : [];

    return new Technician({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      password: doc.password,
      
      onboardingStep: doc.onboardingStep || 1,
      experienceSummary: doc.experienceSummary || "",
      
      avatarUrl: doc.avatarUrl,
      bio: doc.bio,
      
      categoryIds: doc.categoryIds,
      subServiceIds: doc.subServiceIds,
      zoneIds: doc.zoneIds,
      
      documents: mappedDocuments,
      bankDetails: doc.bankDetails,
      walletBalance: doc.walletBalance,
      availability: doc.availability,
      ratings: doc.ratings,
      
      verificationStatus: doc.verificationStatus,
      verificationReason: doc.verificationReason,
      isSuspended: doc.isSuspended,
      suspendReason: doc.suspendReason,
      
      portfolioUrls: doc.portfolioUrls,
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

      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(entity: Technician): Partial<TechnicianDocument> {
    const props = entity.toProps();
    
    // ✅ Fix: Cast generic string to specific Enum for Documents
    const persistenceDocuments = props.documents.map((d: any) => ({
      type: d.type,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      status: d.status as "PENDING" | "APPROVED" | "REJECTED", // Cast here
      rejectionReason: d.rejectionReason,
      uploadedAt: d.uploadedAt || new Date()
    }));

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
      
      documents: persistenceDocuments, // Use the casted docs
      
      bankDetails: props.bankDetails,
      walletBalance: props.walletBalance,
      availability: props.availability,
      ratings: props.ratings,
      verificationStatus: props.verificationStatus as "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED",
      
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
        
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}