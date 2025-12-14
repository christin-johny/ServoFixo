import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { IImageService } from '../../services/IImageService';
import { ServiceSpecification } from '../../../domain/entities/ServiceItem';

interface EditServiceRequest {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  specifications: ServiceSpecification[];
  newImageFiles: { buffer: Buffer; originalName: string; mimeType: string }[];
  imagesToDelete?: string[]; 
  isActive: boolean;
}

export class EditServiceItemUseCase {
  constructor(
    private readonly serviceRepo: IServiceItemRepository,
    private readonly imageService: IImageService
  ) {}

  async execute(request: EditServiceRequest): Promise<any> {
    const service = await this.serviceRepo.findById(request.id);
    if (!service) throw new Error("Service Item not found");

    if (request.imagesToDelete && request.imagesToDelete.length > 0) {
      const deletePromises = request.imagesToDelete.map(async (url) => {
        await this.imageService.deleteImage(url); // Remove from S3
        service.removeImage(url);
      });
      await Promise.all(deletePromises);
    }

    if (request.newImageFiles.length > 0) {
      const uploadPromises = request.newImageFiles.map(file => 
        this.imageService.uploadImage(file.buffer, file.originalName, file.mimeType)
      );
      const newUrls = await Promise.all(uploadPromises);
      service.addImages(newUrls);
    }

    service.updateDetails(
      request.name,
      request.description,
      request.basePrice,
      request.specifications,
      request.isActive
    );

    return this.serviceRepo.update(service);
  }
}