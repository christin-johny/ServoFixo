import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class DeleteAddressUseCase {
  constructor(
    private _addressRepository: IAddressRepository,
    private _logger: ILogger 
  ) {}

  async execute(addressId: string, userId: string): Promise<boolean> {
    const address = await this._addressRepository.findById(addressId);
    if (!address) {
        this._logger.warn(LogEvents.ADDRESS_NOT_FOUND, { addressId });
        throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    }
    
    if (address.getUserId() !== userId) throw new Error(ErrorMessages.UNAUTHORIZED);

    const result = await this._addressRepository.delete(addressId);
    
    this._logger.info(LogEvents.ADDRESS_DELETED, { addressId });

    return result;
  }
}