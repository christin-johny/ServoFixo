import { IServiceCategoryRepository, CategoryQueryParams, PaginatedCategories } from '../../../domain/repositories/IServiceCategoryRepository';
import { ServiceCategory } from '../../../domain/entities/ServiceCategory';
import { ServiceCategoryModel, IServiceCategoryDocument } from '../mongoose/models/ServiceCategoryModel';

export class ServiceCategoryMongoRepository implements IServiceCategoryRepository {

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

    // Build Query
    const query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case insensitive
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute Query + Count in parallel
    const [docs, total] = await Promise.all([
      ServiceCategoryModel.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .exec(),
      ServiceCategoryModel.countDocuments(query).exec()
    ]);

    return {
      data: docs.map(doc => this.toEntity(doc)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string): Promise<ServiceCategory | null> {
    const doc = await ServiceCategoryModel.findById(id).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByName(name: string): Promise<ServiceCategory | null> {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const doc = await ServiceCategoryModel.findOne({ 
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') } 
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

    if (!doc) throw new Error('Category not found for update');
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await ServiceCategoryModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // Helper: Convert Mongo Doc to Domain Entity
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