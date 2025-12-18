import {
  IServiceCategoryRepository,
  CategoryQueryParams,
  PaginatedCategories,
} from "../../../domain/repositories/IServiceCategoryRepository";
import { ServiceCategory } from "../../../domain/entities/ServiceCategory";
import {
  ServiceCategoryModel,
  IServiceCategoryDocument,
} from "../mongoose/models/ServiceCategoryModel";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class ServiceCategoryMongoRepository
  implements IServiceCategoryRepository
{
  async create(category: ServiceCategory): Promise<ServiceCategory> {
    const persistenceData = {
      name: category.getName(),
      description: category.getDescription(),
      iconUrl: category.getIconUrl(),
      isActive: category.getIsActive(),
    };

    const doc = await ServiceCategoryModel.create(persistenceData);
    return this.toEntity(doc);
  }

  async findAll(params: CategoryQueryParams): Promise<PaginatedCategories> {
    const { page, limit, search, isActive } = params;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: { $ne: true } };

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
      ServiceCategoryModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ServiceCategoryModel.countDocuments(query).exec(),
    ]);

    return {
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ServiceCategory | null> {
    const doc = await ServiceCategoryModel.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByName(name: string): Promise<ServiceCategory | null> {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const doc = await ServiceCategoryModel.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, "i") },
      isDeleted: { $ne: true },
    }).exec();

    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(category: ServiceCategory): Promise<ServiceCategory> {
    const doc = await ServiceCategoryModel.findByIdAndUpdate(
      category.getId(),
      {
        name: category.getName(),
        description: category.getDescription(),
        iconUrl: category.getIconUrl(),
        isActive: category.getIsActive(),
      },
      { new: true }
    ).exec();

    if (!doc) throw new Error(ErrorMessages.CATEGORY_NOT_FOUND);
    return this.toEntity(doc);
  }
  async toggleStatus(id: string, isActive: boolean): Promise<boolean> {
    const result = await ServiceCategoryModel.findByIdAndUpdate(id, {
      isActive,
    }).exec();
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ServiceCategoryModel.findByIdAndUpdate(id, {
      isDeleted: true,
    }).exec();
    return !!result;
  }

  private toEntity(doc: IServiceCategoryDocument): ServiceCategory {
    return new ServiceCategory(
      doc._id.toString(),
      doc.name,
      doc.description,
      doc.iconUrl,
      doc.isActive,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
