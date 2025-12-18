import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
export class DeleteAddressUseCase {
  constructor(private addressRepository: IAddressRepository) {}

  async execute(addressId: string, userId: string): Promise<boolean> {
    const address = await this.addressRepository.findById(addressId);
    if (!address) throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    
    if (address.getUserId() !== userId) throw new Error(ErrorMessages.UNAUTHORIZED);

    return await this.addressRepository.delete(addressId);
  }
}