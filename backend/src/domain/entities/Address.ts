import { Phone } from "../../../../shared/types/value-objects/ContactTypes";

// Interface for Constructor Arguments
export interface AddressProps {
  id: string;
  userId: string;
  tag: string;
  isDefault: boolean;
  name: string;
  phone: Phone;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  location: { type: "Point"; coordinates: [number, number] }; // GeoJSON
  zoneId?: string;
  isServiceable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Address {
  private readonly id: string;
  private readonly userId: string;
  private readonly tag: string;
  private readonly isDefault: boolean;
  private readonly name: string;
  private readonly phone: Phone;
  private readonly houseNumber: string;
  private readonly street: string;
  private readonly landmark?: string;
  private readonly city: string;
  private readonly pincode: string;
  private readonly state: string;
  private readonly location: { type: "Point"; coordinates: [number, number] };
  private readonly zoneId?: string;
  private readonly isServiceable: boolean;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(props: AddressProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.tag = props.tag;
    this.isDefault = props.isDefault;
    this.name = props.name;
    this.phone = props.phone;
    this.houseNumber = props.houseNumber;
    this.street = props.street;
    this.landmark = props.landmark;
    this.city = props.city;
    this.pincode = props.pincode;
    this.state = props.state;
    this.location = props.location;
    this.zoneId = props.zoneId;
    this.isServiceable = props.isServiceable;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  // Helper to clone/export data securely
  toProps(): AddressProps {
    return {
      id: this.id,
      userId: this.userId,
      tag: this.tag,
      isDefault: this.isDefault,
      name: this.name,
      phone: this.phone,
      houseNumber: this.houseNumber,
      street: this.street,
      landmark: this.landmark,
      city: this.city,
      pincode: this.pincode,
      state: this.state,
      location: this.location,
      zoneId: this.zoneId,
      isServiceable: this.isServiceable,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Semantic Method for toggling default
  markAsNonDefault(): Address {
    return new Address({ ...this.toProps(), isDefault: false });
  }

  // Getters
  getId(): string { return this.id; }
  getUserId(): string { return this.userId; }
  getIsDefault(): boolean { return this.isDefault; }
  getName(): string { return this.name; }
  getPhone(): Phone { return this.phone; }
  getTag(): string { return this.tag; }
  getHouseNumber(): string { return this.houseNumber; }
  getStreet(): string { return this.street; }
  getLandmark(): string | undefined { return this.landmark; }
  getCity(): string { return this.city; }
  getPincode(): string { return this.pincode; }
  getState(): string { return this.state; }
  getLocation() { return this.location; }
  getZoneId(): string | undefined { return this.zoneId; }
  getIsServiceable(): boolean { return this.isServiceable; }
  
  getFullAddress(): string {
    return `${this.houseNumber}, ${this.street}, ${this.city}, ${this.state} - ${this.pincode}`;
  }
}