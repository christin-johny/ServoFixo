import { Phone } from "../../../../shared/types/value-objects/ContactTypes";

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

  constructor(
    id: string,
    userId: string,
    tag: string,
    isDefault: boolean,
    name: string,
    phone: Phone,
    houseNumber: string,
    street: string,
    city: string,
    pincode: string,
    state: string,
    location: { type: "Point"; coordinates: [number, number] },
    landmark?: string,
    zoneId?: string,
    isServiceable: boolean = false,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.tag = tag;
    this.isDefault = isDefault;
    this.name = name;
    this.phone = phone;
    this.houseNumber = houseNumber;
    this.street = street;
    this.landmark = landmark;
    this.city = city;
    this.pincode = pincode;
    this.state = state;
    this.location = location;
    this.zoneId = zoneId;
    this.isServiceable = isServiceable;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  getId(): string { return this.id; }
  getUserId(): string { return this.userId; }
  getIsDefault(): boolean { return this.isDefault; }
  getName(): string { return this.name; }
  getPhone(): Phone { return this.phone; }
  getTag(): string { return this.tag; }
  getHouseNumber():string{return this.houseNumber}
  getStreet():string{return this.street}
  getLandmark():string| undefined {return this.landmark}
  getCity():string {return this.city}
  getPincode():string {return this.pincode}
  getState():string {return this.state}
  getFullAddress(): string {
    return `${this.houseNumber}, ${this.street}, ${this.city}, ${this.state} - ${this.pincode}`;
  }
  getLocation(): { type: "Point"; coordinates: [number, number] } { return this.location; }
  getZoneId(): string | undefined { return this.zoneId; }
  getIsServiceable(): boolean { return this.isServiceable; }
}