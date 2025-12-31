import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IImageService } from "../../services/IImageService";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Customer } from "../../../domain/entities/Customer";

export class UploadAvatarUseCase {
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

    const avatarUrl = await this._imageService.uploadImage(
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
      avatarUrl,
      customer.getDefaultZoneId(),
      customer.isSuspended(),
      customer.getAdditionalInfo(),
      customer.getGoogleId(),
      customer.getCreatedAt(),
      new Date(),
      customer.getIsDeleted()
    );

    await this._customerRepository.update(updatedCustomer);
    return avatarUrl;
  }
}
