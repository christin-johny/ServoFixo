import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { IImageService } from "../../interfaces/IImageService";
import { ServiceSpecification } from "../../../domain/entities/ServiceItem";

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
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _imageService: IImageService
  ) {}

  async execute(request: EditServiceRequest): Promise<any> {
    const service = await this._serviceRepo.findById(request.id);
    if (!service) throw new Error("Service Item not found");

    if (request.imagesToDelete && request.imagesToDelete.length > 0) {
      const deletePromises = request.imagesToDelete.map(async (url) => {
        await this._imageService.deleteImage(url);
        service.removeImage(url);
      });
      await Promise.all(deletePromises);
    }

    if (request.newImageFiles.length > 0) {
      const uploadPromises = request.newImageFiles.map((file) =>
        this._imageService.uploadImage(
          file.buffer,
          file.originalName,
          file.mimeType
        )
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

    return this._serviceRepo.update(service);
  }
}
