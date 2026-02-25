import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { AddressResponseDto } from "../../dto/address/AddressResponseDto";
import { AddressMapper } from "../../mappers/AddressMapper";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { IGetAddressesUseCase } from "../../interfaces/use-cases/address/IAddressUseCases";

export class GetAddressesUseCase implements IGetAddressesUseCase {
  constructor(
    private _addressRepository: IAddressRepository,
    private _logger: ILogger 
  ) {}

  async execute(userId: string): Promise<AddressResponseDto[]> {
    const addresses = await this._addressRepository.findAllByUserId(userId);
    
    if (!addresses || addresses.length === 0) {
        this._logger.warn(LogEvents.ADDRESS_NOT_FOUND, { userId, reason: "User has no addresses" });
        throw new Error(ErrorMessages.ADDRESS_NOT_FOUND); 
    }

    const sorted = addresses.sort((a, b) => (b.getIsDefault() ? 1 : 0) - (a.getIsDefault() ? 1 : 0));
    
    return sorted.map(addr => AddressMapper.toResponse(addr));
  }
}