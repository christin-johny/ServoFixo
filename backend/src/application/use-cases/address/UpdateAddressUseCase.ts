import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ZoneService } from "../../../domain/services/ZoneService";
import { Address } from "../../../domain/entities/Address";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class UpdateAddressUseCase {
  constructor(
    private _addressRepository: IAddressRepository,
    private _zoneService: ZoneService
  ) {}

  async execute(id: string, userId: string, input: any): Promise<Address> {
    const existing = await this._addressRepository.findById(id);
    if (!existing) throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    if (existing.getUserId() !== userId)
      throw new Error(ErrorMessages.UNAUTHORIZED);

    const lat = input.lat || input.location?.coordinates[1];
    const lng = input.lng || input.location?.coordinates[0];

    let zoneId = existing.getZoneId();
    let isServiceable = existing.getIsServiceable();

    if (lat && lng) {
    const result = await this._zoneService.checkServiceability(lat, lng);
    zoneId = result.zoneId || undefined;
    isServiceable = result.isServiceable;
  }

    if (input.isDefault && !existing.getIsDefault()) {
      const oldDefault = await this._addressRepository.findDefaultByUserId(
        userId
      );
      if (oldDefault && oldDefault.getId() !== id) {
        await this._addressRepository.update(
          this.createNonDefaultCopy(oldDefault)
        );
      }
    }

    const updated = new Address(
      id,
      userId,
      input.tag ?? existing.getTag(),
      input.isDefault ?? existing.getIsDefault(),
      input.name ?? existing.getName(),
      input.phone ?? existing.getPhone(),
      input.houseNumber ?? existing.getHouseNumber(),
      input.street ?? existing.getStreet(),
      input.city ?? existing.getCity(),
      input.pincode ?? existing.getPincode(),
      input.state ?? existing.getState(),
      lat && lng ? { type: "Point", coordinates: [lng, lat] } : existing.getLocation(),
      input.landmark ?? existing.getLandmark(),
      zoneId,
      isServiceable
    );

    return await this._addressRepository.update(updated);
  }

  private createNonDefaultCopy(addr: Address): Address {
    return new Address(
      addr.getId(),
      addr.getUserId(),
      addr.getTag(),
      false,
      addr.getName(),
      addr.getPhone(),
      addr.getHouseNumber(),
      addr.getStreet(),
      addr.getCity(),
      addr.getPincode(),
      addr.getState(),
      addr.getLocation(),
      addr.getLandmark(),
      addr.getZoneId(),
      addr.getIsServiceable()
    );
  }
}
