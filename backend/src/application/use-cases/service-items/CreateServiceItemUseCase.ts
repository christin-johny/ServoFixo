import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';
import { IImageService } from '../../interfaces/IImageService';
import { CreateServiceItemDto } from '../../dto/serviceItem/CreateServiceItemDto';
import { ServiceItemResponseDto } from '../../dto/serviceItem/ServiceItemResponseDto';
import { ServiceItemMapper } from '../../mappers/ServiceItemMapper';
import { ILogger } from '../../interfaces/ILogger';
import { LogEvents } from '../../../../../shared/constants/LogEvents';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export interface IFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export class CreateServiceItemUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(dto: CreateServiceItemDto, imageFiles: IFile[]): Promise<ServiceItemResponseDto> {
    

    const existing = await this._serviceRepo.findByNameAndCategory(dto.name, dto.categoryId);
    if (existing) {
      this._logger.warn(`${LogEvents.SERVICE_CREATE_FAILED} - ${LogEvents.SERVICE_ALREADY_EXISTS}`);
      throw new Error(ErrorMessages.SERVICE_ALREADY_EXISTS);
    }

    if (!imageFiles || imageFiles.length === 0) {
      this._logger.error(`${LogEvents.SERVICE_CREATE_FAILED} - No images provided`);
      throw new Error(ErrorMessages.INVALID_IMAGES);
    }

    const uploadPromises = imageFiles.map(file => 
      this._imageService.uploadImage(file.buffer, file.originalName, file.mimeType)
    );
    
    const imageUrls = await Promise.all(uploadPromises);
    
    const newService = ServiceItemMapper.toDomain(dto, imageUrls);
    const savedService = await this._serviceRepo.create(newService);
    
    return ServiceItemMapper.toResponse(savedService);
  }
}
