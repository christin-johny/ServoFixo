import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { IImageService } from '../../services/IImageService';
import { ServiceItem, ServiceSpecification } from '../../../domain/entities/ServiceItem';

interface CreateServiceRequest {
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  specifications: ServiceSpecification[];
  imageFiles: { buffer: Buffer; originalName: string; mimeType: string }[]; 
  isActive: boolean;
}

export class CreateServiceItemUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _imageService: IImageService
  ) {}

  async execute(request: CreateServiceRequest): Promise<ServiceItem> {
    const existing = await this._serviceRepo.findByNameAndCategory(request.name, request.categoryId);
    if (existing) {
      throw new Error(`Service '${request.name}' already exists in this category.`);
    }

    const uploadPromises = request.imageFiles.map(file => 
      this._imageService.uploadImage(file.buffer, file.originalName, file.mimeType)
    );
    
    const imageUrls = await Promise.all(uploadPromises);

    const newService = new ServiceItem(
      '', 
      request.categoryId,
      request.name,
      request.description,
      request.basePrice,
      request.specifications,
      imageUrls,
      request.isActive,
      new Date(),
      new Date()
    );

    return this._serviceRepo.create(newService);
  }
}