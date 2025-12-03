
import { Email,Phone } from '../../../../shared/types/value-objects/ContactTypes';  

export class Technician {
  private readonly id: string; 
  private readonly name: string;
  private readonly phone: Phone;
  private readonly email: Email; 
  private readonly password: string; 
  private readonly avatarUrl: string;
  private readonly bio: string;
  private readonly experienceSummary: string;
  private readonly categories: string[]; 
  private readonly subServices: string[];
  private readonly zones: string[]; 
  private readonly documents: object[]; 
  private readonly pricing: object;
  private readonly availability: object; 
  private readonly verificationStatus: string; 
  private readonly verificationReason?: string;
  private readonly suspended: boolean;
  private readonly suspendReason?: string;
  private readonly portfolioUrls: string[];
  private readonly earnings: number;
  private readonly ratings: object;
  private readonly additionalInfo: object;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(
    id: string,
    name: string,
    phone: Phone,
    email: Email,
    password: string,
    avatarUrl: string = '',
    bio: string = '',
    experienceSummary: string = '',
    categories: string[] = [],
    subServices: string[] = [],
    zones: string[] = [],
    documents: object[] = [],
    pricing: object = {},
    availability: object = {},
    verificationStatus: string = 'pending',
    verificationReason?: string,
    suspended: boolean = false,
    suspendReason?: string,
    portfolioUrls: string[] = [],
    earnings: number = 0,
    ratings: object = {},
    additionalInfo: object = {},
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.password = password;
    this.avatarUrl = avatarUrl;
    this.bio = bio;
    this.experienceSummary = experienceSummary;
    this.categories = categories;
    this.subServices = subServices;
    this.zones = zones;
    this.documents = documents;
    this.pricing = pricing;
    this.availability = availability;
    this.verificationStatus = verificationStatus;
    this.verificationReason = verificationReason;
    this.suspended = suspended;
    this.suspendReason = suspendReason;
    this.portfolioUrls = portfolioUrls;
    this.earnings = earnings;
    this.ratings = ratings;
    this.additionalInfo = additionalInfo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters 
  getId(): string { return this.id; }
  getEmail(): Email { return this.email; }
}