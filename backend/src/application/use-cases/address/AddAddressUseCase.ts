import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ZoneService } from "../../services/ZoneService";
import { CreateAddressDto } from "../../dto/address/CreateAddressDto";
import { AddressResponseDto } from "../../dto/address/AddressResponseDto";
import { AddressMapper } from "../../mappers/AddressMapper";

export class AddAddressUseCase {
  constructor(
    private _addressRepository: IAddressRepository,
    private _zoneService: ZoneService
  ) {}

  async execute(input: CreateAddressDto, userId: string): Promise<AddressResponseDto> {
    
    // 1. Check Serviceability (External Logic)
    const zoneResult = await this._zoneService.checkServiceability(input.lat, input.lng);

    // 2. Handle "Default Address" Logic
    if (input.isDefault) {
      const oldDefault = await this._addressRepository.findDefaultByUserId(userId);
      if (oldDefault) {
        // Mark old address as non-default using Domain Method
        await this._addressRepository.update(oldDefault.markAsNonDefault());
      }
    }

    // 3. Create New Entity using Mapper
    const newAddress = AddressMapper.toDomain(
      input,
      userId,
      "",
      zoneResult.zoneId || undefined,
      zoneResult.isServiceable
    );

    // 4. Save to Repository
    const savedAddress = await this._addressRepository.create(newAddress);

    // 5. Return Safe DTO
    return AddressMapper.toResponse(savedAddress);
  }
}