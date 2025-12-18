
import { Email,Phone } from '../../../../shared/types/value-objects/ContactTypes';  


export class Customer {
  private readonly id: string; 
  private readonly name: string;
  private readonly phone?: Phone; 
  private readonly email: Email; 
  private readonly password: string; 
  private readonly avatarUrl?: string;
  private readonly defaultZoneId?: string; 
  private readonly suspended: boolean;
  private readonly additionalInfo: object; 
  private readonly googleId?: string; 
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private isDeleted: boolean;

 constructor(
  id: string,
  name: string,
  email: Email,
  password: string,
  phone?: Phone,
  avatarUrl?: string,
  defaultZoneId?: string,
  suspended: boolean = false,
  additionalInfo: object = {},
  googleId?: string,
  createdAt?: Date,
  updatedAt?: Date,
  isDeleted: boolean = false

) {
  this.id = id;
  this.name = name;
  this.phone = phone;
  this.email = email;
  this.password = password;
  this.avatarUrl = avatarUrl;
  this.defaultZoneId = defaultZoneId;
  this.suspended = suspended;
  this.additionalInfo = additionalInfo;
  this.googleId = googleId;
  this.createdAt = createdAt ?? new Date();
  this.updatedAt = updatedAt ?? new Date();
  this.isDeleted = isDeleted;
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
  getAvatarUrl(): string | undefined {return this.avatarUrl}
  getDefaultZoneId():string | undefined {return this.defaultZoneId}
  getIsDeleted(): boolean {return this.isDeleted;}
} 