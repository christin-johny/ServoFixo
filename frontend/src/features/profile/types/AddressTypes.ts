export interface IAddress {
  id: string;
  name: string;
  phone: string;
  tag: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  location: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  isServiceable?: boolean;
}

export interface IAddressFormInput {
  name: string;
  phone: string;
  tag: string;
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
