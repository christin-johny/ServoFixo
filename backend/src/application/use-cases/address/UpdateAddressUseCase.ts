import { IAddressRepository } from "../../../domain/repositories/IAddressRepository"; 
import { IZoneService } from "../../interfaces/services/IZoneService"; 
import { UpdateAddressDto } from "../../dto/address/UpdateAddressDto";
import { AddressResponseDto } from "../../dto/address/AddressResponseDto";
import { AddressMapper } from "../../mappers/AddressMapper";
import { Address } from "../../../domain/entities/Address";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { ILogger } from "../../interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { IUpdateAddressUseCase } from "../../interfaces/use-cases/address/IAddressUseCases";

export class UpdateAddressUseCase implements IUpdateAddressUseCase{
  constructor(
    private _addressRepository: IAddressRepository,
    private _zoneService: IZoneService, 
    private _logger: ILogger 
  ) {}

  async execute(id: string, userId: string, input: UpdateAddressDto): Promise<AddressResponseDto> {
    
    const existing = await this._addressRepository.findById(id);
    if (!existing) {
        this._logger.warn(LogEvents.ADDRESS_NOT_FOUND, { addressId: id });
        throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    }
    if (existing.getUserId() !== userId) throw new Error(ErrorMessages.UNAUTHORIZED);

    let zoneId = existing.getZoneId();
    let isServiceable = existing.getIsServiceable();
    let newLocation = existing.getLocation();

    if (input.lat !== undefined && input.lng !== undefined) { 
      const result = await this._zoneService.checkServiceability(input.lat, input.lng);
      zoneId = result.zoneId || undefined;
      isServiceable = result.isServiceable;
      newLocation = { type: "Point", coordinates: [input.lng, input.lat] };
    }
 
    if (input.isDefault === true && !existing.getIsDefault()) {
      const oldDefault = await this._addressRepository.findDefaultByUserId(userId);
      if (oldDefault && oldDefault.getId() !== id) {
        await this._addressRepository.update(oldDefault.markAsNonDefault());
      }
    }

    const updatedEntity = new Address({
      ...existing.toProps(),
      ...input,
      location: newLocation,
      zoneId: zoneId,
      isServiceable: isServiceable,
      tag: input.tag ?? existing.getTag(),
      name: input.name ?? existing.getName(),
      phone: input.phone ?? existing.getPhone(),
      houseNumber: input.houseNumber ?? existing.getHouseNumber(),
      street: input.street ?? existing.getStreet(),
      landmark: input.landmark ?? existing.getLandmark(),
      city: input.city ?? existing.getCity(),
      pincode: input.pincode ?? existing.getPincode(),
      state: input.state ?? existing.getState(),
      isDefault: input.isDefault ?? existing.getIsDefault(),
    });

    const saved = await this._addressRepository.update(updatedEntity);

    return AddressMapper.toResponse(saved);
  }
}