import { Phone } from "../../../domain/value-objects/ContactTypes";

export class AddressResponseDto {
  id!: string;
  userId!: string;
  tag!: string;
  isDefault!: boolean;
  name!: string;
  phone!: Phone;
  houseNumber!: string;
  street!: string;
  landmark?: string;
  city!: string;
  pincode!: string;
  state!: string;
  location!: { lat: number; lng: number };
  isServiceable!: boolean;
  fullAddress!: string;
}