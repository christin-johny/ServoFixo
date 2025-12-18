import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { ZoneService } from "../../../domain/services/ZoneService";
import { Address } from "../../../domain/entities/Address";
import { Phone } from "../../../../../shared/types/value-objects/ContactTypes";

// 1. THE INPUT DTO (Data Transfer Object)
// This defines exactly what data we need from the Controller
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
    
    // ---------------------------------------------------------
    // STEP 1: ZONE LOGIC (The "Smart" Calculation)
    // ---------------------------------------------------------
    // We calculate if the lat/lng falls inside a service zone.
    const zoneResult = await this.zoneService.checkServiceability(input.lat, input.lng);


    // ---------------------------------------------------------
    // STEP 2: "ONLY ONE DEFAULT" RULE (The Switch)
    // ---------------------------------------------------------
    // If the user wants this new address to be Default, we must find 
    // the OLD default address and turn it OFF (set isDefault = false).
    if (input.isDefault) {
      const oldDefault = await this.addressRepository.findDefaultByUserId(input.userId);

      if (oldDefault) {
        // We create a copy of the old address but force isDefault to FALSE
        const updatedOldAddress = new Address(
            oldDefault.getId(),
            oldDefault.getUserId(),
            oldDefault.getTag(),
            false, // <--- 🔴 TURNING OFF THE OLD SWITCH
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
        // Update the database to reflect this change
        await this.addressRepository.update(updatedOldAddress);
      }
    }

    // ---------------------------------------------------------
    // STEP 3: CREATE THE ENTITY (The Birth)
    // ---------------------------------------------------------
    const newAddress = new Address(
      "", // ID is empty because the Database will generate it
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
      
      // Convert raw lat/lng to GeoJSON format
      { type: "Point", coordinates: [input.lng, input.lat] }, 
      
      input.landmark,
      
      // 🟢 AUTO-FILLED DATA FROM STEP 1
      zoneResult.zoneId || undefined, 
      zoneResult.isServiceable 
    );

    return await this.addressRepository.create(newAddress);
  }
}