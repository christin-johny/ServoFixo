import mongoose from "mongoose";
import {
  IServiceItemRepository,
  ServiceItemQueryParams,
  PaginatedServiceItems,
  ServiceFilters,
} from "../../../domain/repositories/IServiceItemRepository";
import { ServiceItem } from "../../../domain/entities/ServiceItem";
import {
  ServiceItemModel,
  IServiceItemDocument,
} from "../mongoose/models/ServiceItemModel";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class ServiceItemMongoRepository implements IServiceItemRepository {
  async create(serviceItem: ServiceItem): Promise<ServiceItem> {
    const persistenceData = {
      categoryId: new mongoose.Types.ObjectId(serviceItem.getCategoryId()),
      name: serviceItem.getName(),
      description: serviceItem.getDescription(),
      basePrice: serviceItem.getBasePrice(),
      specifications: serviceItem.getSpecifications(),
      imageUrls: serviceItem.getImageUrls(),
      isActive: serviceItem.getIsActive(),
      rating: serviceItem.getRating(),
      reviewCount: serviceItem.getReviewCount()
    };

    const doc = await ServiceItemModel.create(persistenceData);
    return this.toEntity(doc);
  }

  async findAll(params: ServiceItemQueryParams): Promise<PaginatedServiceItems> {
    const { page, limit, search, categoryId, isActive } = params;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: { $ne: true } };

    if (categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [docs, total] = await Promise.all([
      ServiceItemModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ServiceItemModel.countDocuments(query).exec(),
    ]);

    return {
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ServiceItem | null> {
    if (!mongoose.isValidObjectId(id)) return null;

    const docs = await ServiceItemModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "servicecategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "parentCategory",
        },
      },
      { $unwind: "$parentCategory" },
      {
        $match: {
          "parentCategory.isActive": { $ne: false },
          "parentCategory.isDeleted": { $ne: true },
        },
      },
    ]).exec();

    if (!docs || docs.length === 0) return null;
     
    const doc = docs[0];
    return new ServiceItem({
        id: doc._id.toString(),
        categoryId: doc.categoryId.toString(),
        name: doc.name,
        description: doc.description,
        basePrice: doc.basePrice,
        specifications: doc.specifications,
        imageUrls: doc.imageUrls,
        isActive: doc.isActive,
        rating: doc.rating || 0,
        reviewCount: doc.reviewCount || 0,
        bookingCount:doc.bookingCount||0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    });
  }

  async findByNameAndCategory(name: string, categoryId: string): Promise<ServiceItem | null> {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const doc = await ServiceItemModel.findOne({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      name: { $regex: new RegExp(`^${escapedName}$`, "i") },
      isDeleted: { $ne: true },
    }).exec();

    return doc ? this.toEntity(doc) : null;
  }

  async update(serviceItem: ServiceItem): Promise<ServiceItem> {
    const doc = await ServiceItemModel.findByIdAndUpdate(
      serviceItem.getId(),
      {
        name: serviceItem.getName(),
        description: serviceItem.getDescription(),
        basePrice: serviceItem.getBasePrice(),
        specifications: serviceItem.getSpecifications(),
        imageUrls: serviceItem.getImageUrls(),
        isActive: serviceItem.getIsActive(),
        rating: serviceItem.getRating(),
        reviewCount: serviceItem.getReviewCount()
      },
      { new: true }
    ).exec();

    if (!doc) throw new Error(ErrorMessages.SERVICE_NOT_FOUND);
    return this.toEntity(doc);
  }

  async toggleStatus(id: string, isActive: boolean): Promise<boolean> {
    const result = await ServiceItemModel.findByIdAndUpdate(id, { isActive }).exec();
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ServiceItemModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
    return !!result;
  }

  async findMostBooked(limit: number): Promise<ServiceItem[]> {
    const docs = await ServiceItemModel.aggregate([
      { $match: { isDeleted: { $ne: true }, isActive: true } },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
    ]);
    return docs.map(doc => new ServiceItem({
        id: doc._id.toString(),
        categoryId: doc.categoryId.toString(),
        name: doc.name,
        description: doc.description,
        basePrice: doc.basePrice,
        specifications: doc.specifications,
        imageUrls: doc.imageUrls,
        isActive: doc.isActive,
        rating: doc.rating || 0,
        reviewCount: doc.reviewCount || 0,
        bookingCount:doc.bookingCount||0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    }));
  }

  async findWithFilters(filters: ServiceFilters): Promise<ServiceItem[]> {
    const query: any = { isDeleted: false };

    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.searchTerm) {
      query.$or = [
        { name: { $regex: filters.searchTerm, $options: "i" } },
        { description: { $regex: filters.searchTerm, $options: "i" } },
      ];
    }
    if (filters.minPrice || filters.maxPrice) {
      query.basePrice = {};
      if (filters.minPrice) query.basePrice.$gte = filters.minPrice;
      if (filters.maxPrice) query.basePrice.$lte = filters.maxPrice;
    }

    let sortOptions: any = {};
    switch (filters.sortBy) {
      case "price_asc": sortOptions = { basePrice: 1 }; break;
      case "price_desc": sortOptions = { basePrice: -1 }; break;
      case "newest": sortOptions = { createdAt: -1 }; break;
      default: sortOptions = { bookingCount: -1 };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const docs = await ServiceItemModel.find(query)
      .populate({ path: "categoryId", match: { isDeleted: false, isActive: true }, select: "name" })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const validDocs = docs.filter((doc) => doc.categoryId !== null);
    return validDocs.map((doc) => this.toEntity(doc));
  }
  // ... inside the class ...

  async addRating(id: string, newRating: number): Promise<void> {
    const service = await ServiceItemModel.findById(id);
    if (!service) return;

    // Calculate new Moving Average
    const currentAvg = service.rating || 0;
    const currentCount = service.reviewCount || 0;
    
    const newCount = currentCount + 1;
    const newAvg = ((currentAvg * currentCount) + newRating) / newCount;
    
    // Round to 1 decimal (e.g., 4.5)
    const roundedAvg = Math.round(newAvg * 10) / 10;

    await ServiceItemModel.findByIdAndUpdate(id, {
      $set: {
        rating: roundedAvg,
        reviewCount: newCount
      }
    }).exec();
  }

  async incrementBookingCount(id: string): Promise<void> {
    await ServiceItemModel.findByIdAndUpdate(id, {
        $inc: { bookingCount: 1 }
    }).exec();
  }

  private toEntity(doc: IServiceItemDocument): ServiceItem {
    return new ServiceItem({
      id: doc._id.toString(),
      categoryId: doc.categoryId.toString(),
      name: doc.name,
      description: doc.description,
      basePrice: doc.basePrice,
      specifications: doc.specifications || [],
      imageUrls: doc.imageUrls || [],
      isActive: doc.isActive,
      rating: doc.rating || 0,
      reviewCount: doc.reviewCount || 0,
      bookingCount:doc.bookingCount||0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}