import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IImageService } from "../../interfaces/IImageService";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { Customer } from "../../../domain/entities/Customer";
import { ILogger } from "../../interfaces/ILogger";
import { S3UrlHelper } from "../../../infrastructure/storage/S3UrlHelper";

export class UploadAvatarUseCase {
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(
    userId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string }
  ): Promise<string> {
    const customer = await this._customerRepository.findById(userId);
    if (!customer) throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);

    // 1. This now returns the KEY (e.g. "avatars/unique-name.jpg")
    const avatarKey = await this._imageService.uploadImage(
      file.buffer,
      file.originalName,
      file.mimeType
    );

    const updatedCustomer = new Customer(
      customer.getId(),
      customer.getName(),
      customer.getEmail(),
      customer.getPassword(),
      customer.getPhone(),
      avatarKey, // Save the KEY to the database
      customer.getDefaultZoneId(),
      customer.isSuspended(),
      customer.getAdditionalInfo(),
      customer.getGoogleId(),
      customer.getCreatedAt(),
      new Date(),
      customer.getIsDeleted()
    );

    await this._customerRepository.update(updatedCustomer);
    
    // 2. Wrap the return value so the frontend gets a clickable URL
    return S3UrlHelper.getFullUrl(avatarKey);
  }
}