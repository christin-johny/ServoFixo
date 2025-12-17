
import { Email,Phone } from '../../../../shared/types/value-objects/ContactTypes';  


export class Customer {
  private readonly id: string; 
  private readonly name: string;
  private readonly phone?: Phone; 
  private readonly email: Email; 
  private readonly password: string; 
  private readonly avatarUrl?: string;
  private readonly defaultZoneId?: string; 
  private readonly addresses: object[];
  private readonly suspended: boolean;
  private readonly additionalInfo: object; 
  private readonly googleId?: string; 
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
  this.additionalInfo = additionalInfo;
  this.googleId = googleId;
  this.createdAt = createdAt ?? new Date();
  this.updatedAt = updatedAt ?? new Date();
}


  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getEmail(): Email { return this.email; }
  getPassword():string{return this.password;}
  getPhone(): Phone | undefined { return this.phone; }
  getGoogleId(): string | undefined { return this.googleId; }
  getCreatedAt(): Date { return this.createdAt; }
  getAdditionalInfo():object{return this.additionalInfo}
  isSuspended(): boolean {return this.suspended}
  getAddresses(): object[] {return this.addresses}
  getAvatarUrl(): string | undefined {return this.avatarUrl}
  getDefaultZoneId():string | undefined {return this.defaultZoneId}
} 