import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { IImageService } from '../../services/IImageService';

export class DeleteServiceItemUseCase {
  constructor(
    private readonly serviceRepo: IServiceItemRepository,
    private readonly imageService: IImageService
  ) {}

  async execute(id: string): Promise<void> {
    const service = await this.serviceRepo.findById(id);
    if (!service) throw new Error('Service Item not found');

    // 1. Delete all images from S3
    const deletePromises = service.getImageUrls().map(url => 
      this.imageService.deleteImage(url)
    );
    await Promise.all(deletePromises);

    // 2. Delete from DB
    await this.serviceRepo.delete(id);
  }
}