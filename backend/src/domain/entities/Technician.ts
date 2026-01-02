import {
  TechnicianDocument,
  TechnicianBankDetails,
  TechnicianLocation,
  EmergencyContact,
  TechnicianAvailability,
  TechnicianRatings,
  TechnicianWallet,
  VerificationStatus,
} from "../../../../shared/types/value-objects/TechnicianTypes";

export interface TechnicianProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;

  // Professional
  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  // Complex Objects
  documents: TechnicianDocument[];
  bankDetails?: TechnicianBankDetails;
  walletBalance: TechnicianWallet;
  availability: TechnicianAvailability;
  ratings: TechnicianRatings;

  // Status
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  isSuspended: boolean;
  suspendReason?: string;

  // Extra
  portfolioUrls: string[];
  deviceToken?: string;
  currentLocation?: TechnicianLocation;
  emergencyContact?: EmergencyContact;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Technician {
  private readonly id: string;
  private readonly name: string;
  private readonly email: string;
  private readonly phone: string;
  private readonly password: string;
  private readonly avatarUrl?: string;
  private readonly bio?: string;
  private readonly experienceSummary?: string;

  private readonly categoryIds: string[];
  private readonly subServiceIds: string[];
  private readonly zoneIds: string[];

  private readonly documents: TechnicianDocument[];
  private readonly bankDetails?: TechnicianBankDetails;
  private readonly walletBalance: TechnicianWallet;
  private readonly availability: TechnicianAvailability;
  private readonly ratings: TechnicianRatings;

  private readonly verificationStatus: VerificationStatus;
  private readonly verificationReason?: string;
  private readonly isSuspended: boolean;
  private readonly suspendReason?: string;

  private readonly portfolioUrls: string[];
  private readonly deviceToken?: string;
  private readonly currentLocation?: TechnicianLocation;
  private readonly emergencyContact?: EmergencyContact;

  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(props: TechnicianProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.password = props.password;
    this.avatarUrl = props.avatarUrl;
    this.bio = props.bio;
    this.experienceSummary = props.experienceSummary;
    this.categoryIds = props.categoryIds;
    this.subServiceIds = props.subServiceIds;
    this.zoneIds = props.zoneIds;
    this.documents = props.documents;
    this.bankDetails = props.bankDetails;
    this.walletBalance = props.walletBalance;
    this.availability = props.availability;
    this.ratings = props.ratings;
    this.verificationStatus = props.verificationStatus;
    this.verificationReason = props.verificationReason;
    this.isSuspended = props.isSuspended;
    this.suspendReason = props.suspendReason;
    this.portfolioUrls = props.portfolioUrls;
    this.deviceToken = props.deviceToken;
    this.currentLocation = props.currentLocation;
    this.emergencyContact = props.emergencyContact;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  // --- Getters ---
  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getPhone(): string { return this.phone; }
  getPassword(): string { return this.password; }
  getAvatarUrl(): string | undefined { return this.avatarUrl; }
  getBio(): string | undefined { return this.bio; }
  getExperienceSummary(): string | undefined { return this.experienceSummary; }

  getCategoryIds(): string[] { return this.categoryIds; }
  getSubServiceIds(): string[] { return this.subServiceIds; }
  getZoneIds(): string[] { return this.zoneIds; }

  getDocuments(): TechnicianDocument[] { return this.documents; }
  getBankDetails(): TechnicianBankDetails | undefined { return this.bankDetails; }
  getWalletBalance(): TechnicianWallet { return this.walletBalance; }
  getAvailability(): TechnicianAvailability { return this.availability; }
  getRatings(): TechnicianRatings { return this.ratings; }

  getVerificationStatus(): VerificationStatus { return this.verificationStatus; }
  getVerificationReason(): string | undefined { return this.verificationReason; }
  
  // ✅ FIX: Renamed to avoid collision with property 'isSuspended'
  getIsSuspended(): boolean { return this.isSuspended; }
  
  getSuspendReason(): string | undefined { return this.suspendReason; }

  getPortfolioUrls(): string[] { return this.portfolioUrls; }
  getDeviceToken(): string | undefined { return this.deviceToken; }
  getCurrentLocation(): TechnicianLocation | undefined { return this.currentLocation; }
  getEmergencyContact(): EmergencyContact | undefined { return this.emergencyContact; }

  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // --- Domain Logic Methods (Returning new instances) ---

  // 1. Helper to export props (for cloning)
  toProps(): TechnicianProps {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      experienceSummary: this.experienceSummary,
      categoryIds: this.categoryIds,
      subServiceIds: this.subServiceIds,
      zoneIds: this.zoneIds,
      documents: this.documents,
      bankDetails: this.bankDetails,
      walletBalance: this.walletBalance,
      availability: this.availability,
      ratings: this.ratings,
      verificationStatus: this.verificationStatus,
      verificationReason: this.verificationReason,
      isSuspended: this.isSuspended,
      suspendReason: this.suspendReason,
      portfolioUrls: this.portfolioUrls,
      deviceToken: this.deviceToken,
      currentLocation: this.currentLocation,
      emergencyContact: this.emergencyContact,
      createdAt: this.createdAt,
      updatedAt: new Date() // Always update timestamp on clone
    };
  }

  // 2. Document Logic
  addDocument(doc: TechnicianDocument): Technician {
    const updatedDocs = [...this.documents, doc];
    return new Technician({ ...this.toProps(), documents: updatedDocs });
  }

  // 3. Status Logic
  verify(): Technician {
    return new Technician({ ...this.toProps(), verificationStatus: 'VERIFIED', verificationReason: undefined });
  }

  reject(reason: string): Technician {
    return new Technician({ ...this.toProps(), verificationStatus: 'REJECTED', verificationReason: reason });
  }

  // 4. Availability
  toggleOnlineStatus(isOnline: boolean): Technician {
    const updatedAvailability = { ...this.availability, isOnline, lastSeen: new Date() };
    return new Technician({ ...this.toProps(), availability: updatedAvailability });
  }

  updateLocation(location: TechnicianLocation): Technician {
    return new Technician({ ...this.toProps(), currentLocation: location });
  }
}