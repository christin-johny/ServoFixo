import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ZoneService } from "../../services/ZoneService";
import { UpdateAddressDto } from "../../dto/address/UpdateAddressDto";
import { AddressResponseDto } from "../../dto/address/AddressResponseDto";
import { AddressMapper } from "../../mappers/AddressMapper";
import { Address } from "../../../domain/entities/Address";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class UpdateAddressUseCase {
  constructor(
    private _addressRepository: IAddressRepository,
    private _zoneService: ZoneService
  ) {}

  async execute(id: string, userId: string, input: UpdateAddressDto): Promise<AddressResponseDto> {
    
    // 1. Fetch Existing
    const existing = await this._addressRepository.findById(id);
    if (!existing) throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    if (existing.getUserId() !== userId) throw new Error(ErrorMessages.UNAUTHORIZED);

    // 2. Calculate New Zone/Serviceability (only if location changed)
    let zoneId = existing.getZoneId();
    let isServiceable = existing.getIsServiceable();
    let newLocation = existing.getLocation();

    if (input.lat !== undefined && input.lng !== undefined) {
      const result = await this._zoneService.checkServiceability(input.lat, input.lng);
      zoneId = result.zoneId || undefined;
      isServiceable = result.isServiceable;
      newLocation = { type: "Point", coordinates: [input.lng, input.lat] };
    }

    // 3. Handle Default Toggle
    if (input.isDefault === true && !existing.getIsDefault()) {
      const oldDefault = await this._addressRepository.findDefaultByUserId(userId);
      if (oldDefault && oldDefault.getId() !== id) {
        await this._addressRepository.update(oldDefault.markAsNonDefault());
      }
    }

    // 4. Create Updated Entity (Immutable Update)
    // We combine existing props + input DTO
    const updatedEntity = new Address({
      ...existing.toProps(), // Start with existing data
      ...input,              // Overwrite with inputs (TS will ignore undefined/nulls here if configured, else be careful)
      location: newLocation, // Overwrite complex fields manually
      zoneId: zoneId,
      isServiceable: isServiceable,
      // Ensure we don't accidentally overwrite strict fields with undefined if input is partial
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

    // 5. Save & Return
    const saved = await this._addressRepository.update(updatedEntity);
    return AddressMapper.toResponse(saved);
  }
}