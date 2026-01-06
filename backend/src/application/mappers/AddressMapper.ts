import { Address } from "../../domain/entities/Address";
import { CreateAddressDto } from "../dto/address/CreateAddressDto";
import { AddressResponseDto } from "../dto/address/AddressResponseDto";

export class AddressMapper {
  static toDomain(
    dto: CreateAddressDto,
    userId: string,
    id: string,
    zoneId: string | undefined,
    isServiceable: boolean
  ): Address {
    return new Address({
      id: id,
      userId: userId,
      tag: dto.tag,
      isDefault: dto.isDefault,
      name: dto.name,
      phone: dto.phone,
      houseNumber: dto.houseNumber,
      street: dto.street,
      landmark: dto.landmark,
      city: dto.city,
      pincode: dto.pincode,
      state: dto.state,
      location: { type: "Point", coordinates: [dto.lng, dto.lat] },
      zoneId: zoneId,
      isServiceable: isServiceable,
    });
  }

  static toResponse(entity: Address): AddressResponseDto {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      tag: entity.getTag(),
      isDefault: entity.getIsDefault(),
      name: entity.getName(),
      phone: entity.getPhone(),
      houseNumber: entity.getHouseNumber(),
      street: entity.getStreet(),
      landmark: entity.getLandmark(),
      city: entity.getCity(),
      pincode: entity.getPincode(),
      state: entity.getState(),
      location: {
        lat: entity.getLocation().coordinates[1],
        lng: entity.getLocation().coordinates[0],
      },
      isServiceable: entity.getIsServiceable(),
      fullAddress: entity.getFullAddress(),
    };
  }
}
