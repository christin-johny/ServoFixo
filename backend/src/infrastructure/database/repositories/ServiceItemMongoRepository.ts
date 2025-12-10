import mongoose from 'mongoose';
import { IServiceItemRepository, ServiceItemQueryParams, PaginatedServiceItems } from '../../../domain/repositories/IServiceItemRepository';
import { ServiceItem } from '../../../domain/entities/ServiceItem';
import { ServiceItemModel, IServiceItemDocument } from '../mongoose/models/ServiceItemModel';

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
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [docs, total] = await Promise.all([
      ServiceItemModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ServiceItemModel.countDocuments(query).exec()
    ]);

    return {
      data: docs.map(doc => this.toEntity(doc)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string): Promise<ServiceItem | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await ServiceItemModel.findOne({ 
        _id: id, 
        isDeleted: { $ne: true } 
    }).exec();
    
    return doc ? this.toEntity(doc) : null;
  }

  async findByNameAndCategory(name: string, categoryId: string): Promise<ServiceItem | null> {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const doc = await ServiceItemModel.findOne({ 
      categoryId: new mongoose.Types.ObjectId(categoryId),
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      isDeleted: { $ne: true }
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

    if (!doc) throw new Error('Service Item not found for update');
    return this.toEntity(doc);
  }

  // ✅ NEW METHOD: Lightweight Status Toggle
  async toggleStatus(id: string, isActive: boolean): Promise<boolean> {
    const result = await ServiceItemModel.findByIdAndUpdate(id, { isActive }).exec();
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ServiceItemModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
    return !!result;
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