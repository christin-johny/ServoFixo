import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { IDeleteAddressUseCase } from "../../interfaces/use-cases/address/IAddressUseCases";

export class DeleteAddressUseCase implements IDeleteAddressUseCase {
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
    

    return result;
  }
}