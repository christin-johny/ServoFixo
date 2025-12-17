import { IServiceCategoryRepository } from "../../../domain/repositories/IServiceCategoryRepository";
import { IImageService } from "../../services/IImageService";
import { ServiceCategory } from "../../../domain/entities/ServiceCategory";

interface CreateCategoryRequest {
  name: string;
  description: string;
  imageFile?: { buffer: Buffer; originalName: string; mimeType: string };
  isActive: boolean;
}

export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepo: IServiceCategoryRepository,
    private readonly imageService: IImageService
  ) {}

  async execute(request: CreateCategoryRequest): Promise<ServiceCategory> {
    console.log(request.name)
    const existing = await this.categoryRepo.findByName(request.name);
    if (existing) {
      throw new Error("Category with this name already exists");
    }

    if (!request.imageFile) {
      throw new Error("Category icon/image is required");
    }

    const iconUrl = await this.imageService.uploadImage(
      request.imageFile.buffer,
      request.imageFile.originalName,
      request.imageFile.mimeType
    );

    const newCategory = new ServiceCategory(
      "",
      request.name,
      request.description,
      iconUrl,
      request.isActive,
      new Date(),
      new Date()
    );

    return this.categoryRepo.create(newCategory);
  }
}
