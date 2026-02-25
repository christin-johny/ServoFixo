import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IImageService } from "../../interfaces/services/IImageService";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { Customer } from "../../../domain/entities/Customer"; 
import { S3UrlHelper } from "../../../infrastructure/storage/S3UrlHelper";
import { IUploadAvatarUseCase } from "../../interfaces/use-cases/customer/ICustomerUseCases";

export class UploadAvatarUseCase  implements IUploadAvatarUseCase{
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _imageService: IImageService 
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
      avatarKey,  
      customer.getDefaultZoneId(),
      customer.isSuspended(),
      customer.getAdditionalInfo(),
      customer.getGoogleId(),
      customer.getCreatedAt(),
      new Date(),
      customer.getIsDeleted()
    );

    await this._customerRepository.update(updatedCustomer);
     
    return S3UrlHelper.getFullUrl(avatarKey);
  }
}