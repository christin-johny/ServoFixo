import { Phone } from "../../../../../shared/types/value-objects/ContactTypes";

export class CreateAddressDto {
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
  lat!: number;
  lng!: number;
}