import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { Address } from "../../../domain/entities/Address";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
export class GetMyAddressesUseCase {
  constructor(private addressRepository: IAddressRepository) {}

  async execute(userId: string): Promise<Address[]> {
    const addresses = await this.addressRepository.findAllByUserId(userId);
    if (!addresses) throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    return addresses?.sort((a, b) => (b.getIsDefault() ? 1 : 0) - (a.getIsDefault() ? 1 : 0));
  }
}