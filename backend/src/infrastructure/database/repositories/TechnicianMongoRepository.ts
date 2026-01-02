import { FilterQuery, HydratedDocument } from "mongoose";
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
    // Remove _id from persistence data to avoid immutable field error in Mongo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { _id, ...updateData } = persistenceData as any;

    const doc = await TechnicianModel.findByIdAndUpdate(
      technician.getId(),
      updateData,
      { new: true }
    ).exec();

    if (!doc) throw new Error("Technician not found");
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

  // --- Mappers ---

  // Converts DB Document -> Domain Entity
  private toDomain(doc: TechnicianDocument): Technician {
    // ✅ CRITICAL FIX: Safe access to coordinates to prevent "reading '0' of undefined"
    const hasCoordinates = 
      doc.currentLocation && 
      doc.currentLocation.coordinates && 
      Array.isArray(doc.currentLocation.coordinates) &&
      doc.currentLocation.coordinates.length >= 2;

    return new Technician({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      password: doc.password,
      avatarUrl: doc.avatarUrl,
      bio: doc.bio,
      experienceSummary: doc.experienceSummary,
      categoryIds: doc.categoryIds,
      subServiceIds: doc.subServiceIds,
      zoneIds: doc.zoneIds,
      documents: doc.documents,
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
      
      // Handle optional GeoJSON mapping securely
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

  // Converts Domain Entity -> DB Persistence Object
  private toPersistence(entity: Technician): Partial<TechnicianDocument> {
    const props = entity.toProps();
    
    return {
      name: props.name,
      email: props.email,
      phone: props.phone,
      password: props.password,
      avatarUrl: props.avatarUrl,
      bio: props.bio,
      experienceSummary: props.experienceSummary,
      categoryIds: props.categoryIds,
      subServiceIds: props.subServiceIds,
      zoneIds: props.zoneIds,
      documents: props.documents,
      bankDetails: props.bankDetails,
      walletBalance: props.walletBalance,
      availability: props.availability,
      ratings: props.ratings,
      verificationStatus: props.verificationStatus,
      verificationReason: props.verificationReason,
      isSuspended: props.isSuspended,
      suspendReason: props.suspendReason,
      portfolioUrls: props.portfolioUrls,
      deviceToken: props.deviceToken,
      emergencyContact: props.emergencyContact,

      // Handle optional GeoJSON mapping
      currentLocation: props.currentLocation
        ? {
            type: "Point",
            coordinates: props.currentLocation.coordinates,
            lastUpdated: props.currentLocation.lastUpdated,
          }
        : undefined,
        
      // Explicitly allow overriding timestamps if needed, else Mongoose handles it
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}