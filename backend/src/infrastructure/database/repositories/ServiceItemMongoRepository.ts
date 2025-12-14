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
    };

    const doc = await ServiceItemModel.create(persistenceData);
    return this.toEntity(doc);
  }

  async findAll(
    params: ServiceItemQueryParams
  ): Promise<PaginatedServiceItems> {
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
        // 1. MATCH: Find the service itself
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                isDeleted: { $ne: true },
                isActive: { $ne: false }
            }
        },
        // 2. LOOKUP: Join with the ServiceCategory collection
        {
            $lookup: {
                from: "servicecategories", // Mongoose default collection name for 'ServiceCategory'
                localField: "categoryId",  // Matches your schema exactly
                foreignField: "_id",
                as: "parentCategory"
            }
        },
        // 3. UNWIND: Flatten the array to access fields easily
        {
            $unwind: "$parentCategory"
        },
        // 4. FILTER: Check if the Parent Category is active and not deleted
        {
            $match: {
                "parentCategory.isActive": { $ne: false },
                "parentCategory.isDeleted": { $ne: true }
            }
        }
    ]).exec();

    // If array is empty, it means Service not found OR Category is blocked
    if (!docs || docs.length === 0) {
        return null;
    }

    // Return the first result mapped to your entity
    return this.toEntity(docs[0]);
}

  async findByNameAndCategory(
    name: string,
    categoryId: string
  ): Promise<ServiceItem | null> {
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
      },
      { new: true }
    ).exec();

    if (!doc) throw new Error("Service Item not found for update");
    return this.toEntity(doc);
  }

  // ✅ NEW METHOD: Lightweight Status Toggle
  async toggleStatus(id: string, isActive: boolean): Promise<boolean> {
    const result = await ServiceItemModel.findByIdAndUpdate(id, {
      isActive,
    }).exec();
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ServiceItemModel.findByIdAndUpdate(id, {
      isDeleted: true,
    }).exec();
    return !!result;
  }
  async findMostBooked(limit: number): Promise<ServiceItem[]> {
    const docs = await ServiceItemModel.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "servicecategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $match: {
          "category.isDeleted": { $ne: true },
          "category.isActive": true,
        },
      },

      { $sort: { bookingCount: -1 } },

      { $limit: limit },
    ]);

    return docs.map((doc) => this.toEntity(doc));
  }

  async findWithFilters(filters: ServiceFilters): Promise<ServiceItem[]> {
    const query: any = {};

    query.isDeleted = false;

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.categoryId) {
      query.categoryId = filters.categoryId;
    }

    if (filters.searchTerm) {
      query.$or = [
        { name: { $regex: filters.searchTerm, $options: "i" } },
        { description: { $regex: filters.searchTerm, $options: "i" } },
      ];
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    let sortOptions: any = {};
    switch (filters.sortBy) {
      case "price_asc":
        sortOptions = { price: 1 };
        break;
      case "price_desc":
        sortOptions = { price: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { bookingCount: -1 };
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const docs = await ServiceItemModel.find(query)
      .populate({
        path: 'categoryId',
        match: { isDeleted: false, isActive: true },
        select: 'name'
      })
      .sort(sortOptions) 
      .skip(skip)        
      .limit(limit)      
      .exec();

    const validDocs = docs.filter((doc) => doc.categoryId !== null);

    return validDocs.map((doc) => this.toEntity(doc));
  }

  private toEntity(doc: IServiceItemDocument): ServiceItem {
    return new ServiceItem(
      doc._id.toString(),
      doc.categoryId.toString(),
      doc.name,
      doc.description,
      doc.basePrice,
      doc.specifications || [],
      doc.imageUrls || [],
      doc.isActive,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
