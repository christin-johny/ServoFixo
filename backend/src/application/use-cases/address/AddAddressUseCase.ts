import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { IZoneService } from "../../interfaces/IZoneService"; 
import { CreateAddressDto } from "../../dto/address/CreateAddressDto";
import { AddressResponseDto } from "../../dto/address/AddressResponseDto";
import { AddressMapper } from "../../mappers/AddressMapper";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class AddAddressUseCase {
  constructor(
    private _addressRepository: IAddressRepository,
    private _zoneService: IZoneService,  
    private _logger: ILogger 
  ) {}

  async execute(input: CreateAddressDto, userId: string): Promise<AddressResponseDto> {
     
    const zoneResult = await this._zoneService.checkServiceability(input.lat, input.lng);

    if (input.isDefault) {
      const oldDefault = await this._addressRepository.findDefaultByUserId(userId);
      if (oldDefault) {
        await this._addressRepository.update(oldDefault.markAsNonDefault());
      }
    }

    const newAddress = AddressMapper.toDomain(
      input,
      userId,
      "",
      zoneResult.zoneId || undefined,
      zoneResult.isServiceable
    );

    const savedAddress = await this._addressRepository.create(newAddress);
    


    return AddressMapper.toResponse(savedAddress);
  }
}