import { Phone } from "../../../domain/value-objects/ContactTypes";

export class UpdateAddressDto {
  tag?: string;
  isDefault?: boolean;
  name?: string;
  phone?: Phone;
  houseNumber?: string;
  street?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  state?: string;
  lat?: number;
  lng?: number;
}