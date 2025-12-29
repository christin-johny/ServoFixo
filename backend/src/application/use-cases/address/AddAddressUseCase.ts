import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ZoneService } from "../../../domain/services/ZoneService";
import { Address } from "../../../domain/entities/Address";

export interface AddAddressDTO {
  userId: string;
  tag: string;
  name: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export class AddAddressUseCase {
  constructor(
    private addressRepository: IAddressRepository,
    private zoneService: ZoneService
  ) {}

  async execute(input: AddAddressDTO): Promise<Address> {
    
    const zoneResult = await this.zoneService.checkServiceability(input.lat, input.lng);

    if (input.isDefault) {
      const oldDefault = await this.addressRepository.findDefaultByUserId(input.userId);

      if (oldDefault) {
        const updatedOldAddress = new Address(
            oldDefault.getId(),
            oldDefault.getUserId(),
            oldDefault.getTag(),
            false,
            oldDefault.getName(),
            oldDefault.getPhone(),
            oldDefault.getHouseNumber(),
            oldDefault.getStreet(),
            oldDefault.getCity(),
            oldDefault.getPincode(),
            oldDefault.getState(),
            oldDefault.getLocation(),
            oldDefault.getLandmark(),
            oldDefault.getZoneId(),
            oldDefault.getIsServiceable()
        );
        await this.addressRepository.update(updatedOldAddress);
      }
    }

    const newAddress = new Address(
      "", 
      input.userId,
      input.tag,
      input.isDefault,
      input.name,
      input.phone, 
      input.houseNumber,
      input.street,
      input.city,
      input.pincode,
      input.state,
      
      { type: "Point", coordinates: [input.lng, input.lat] }, 
      
      input.landmark,
      
      zoneResult.zoneId || undefined, 
      zoneResult.isServiceable 
    );

    return await this.addressRepository.create(newAddress);
  }
}