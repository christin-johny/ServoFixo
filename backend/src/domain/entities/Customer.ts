
import { Email,Phone } from '../../../../shared/types/value-objects/ContactTypes';  // Shared Email type


export class Customer {
  private readonly id: string; 
  private readonly name: string;
  private readonly phone?: Phone; // Optional, as per ERD
  private readonly email: Email; // Required for OTP, using shared type
  private readonly password: string; // Hashed in use case later
  private readonly avatarUrl?: string; // Optional
  private readonly defaultZoneId?: string; // FK to zones, for Point 3
  private readonly addresses: object[]; // Array of address objects
  private readonly suspended: boolean;
  private readonly suspendReason?: string;
  private readonly additionalInfo: object; // Flexible object for extras
  private readonly googleId?: string; // Optional, for Google Auth
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

 constructor(
  id: string,
  name: string,
  email: Email,
  password: string,
  phone?: Phone,
  avatarUrl?: string,
  defaultZoneId?: string,
  addresses: object[] = [],
  suspended: boolean = false,
  suspendReason?: string,
  additionalInfo: object = {},
  googleId?: string,
  createdAt?: Date,
  updatedAt?: Date
) {
  this.id = id;
  this.name = name;
  this.phone = phone;
  this.email = email;
  this.password = password;
  this.avatarUrl = avatarUrl;
  this.defaultZoneId = defaultZoneId;
  this.addresses = addresses;
  this.suspended = suspended;
  this.suspendReason = suspendReason;
  this.additionalInfo = additionalInfo;
  this.googleId = googleId;
  this.createdAt = createdAt ?? new Date();
  this.updatedAt = updatedAt ?? new Date();
}


  // Getters for immutability (no setters – create new entity for changes)
  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getEmail(): Email { return this.email; }
  getPassword():string{return this.password;}
  getPhone(): Phone | undefined { return this.phone; }
  getGoogleId(): string | undefined { return this.googleId; }
  getCreatedAt(): Date { return this.createdAt; }
} 