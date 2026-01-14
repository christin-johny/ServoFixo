import {
  TechnicianDocument,
  TechnicianBankDetails,
  TechnicianWallet,
  TechnicianAvailability,
  TechnicianRatings,
  VerificationStatus,
  TechnicianLocation,
  EmergencyContact,
  ServiceRequest,
  ZoneRequest,
  BankUpdateRequest,
  PayoutStatus,
} from "../../../../shared/types/value-objects/TechnicianTypes"; //

export interface TechnicianProps {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;

  onboardingStep?: number;
  experienceSummary?: string;

  avatarUrl?: string;
  bio?: string;
  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  serviceRequests?: ServiceRequest[];
  zoneRequests?: ZoneRequest[];
  bankUpdateRequests?: BankUpdateRequest[];
  payoutStatus?: PayoutStatus;

  documents: TechnicianDocument[];
  bankDetails?: TechnicianBankDetails;

  walletBalance?: TechnicianWallet;
  availability?: TechnicianAvailability;
  ratings?: TechnicianRatings;

  verificationStatus?: VerificationStatus;
  verificationReason?: string;

  isSuspended?: boolean;
  suspendReason?: string;
  portfolioUrls?: string[];
  deviceToken?: string;

  currentLocation?: TechnicianLocation;
  emergencyContact?: EmergencyContact;

  isOnline?: boolean;
  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Technician {
  private _id: string;
  private _name: string;
  private _email: string;
  private _phone: string;
  private _password?: string;

  private _onboardingStep: number;
  private _experienceSummary: string;

  private _avatarUrl?: string;
  private _bio?: string;
  private _categoryIds: string[];
  private _subServiceIds: string[];
  private _zoneIds: string[];

  private _serviceRequests: ServiceRequest[];
  private _zoneRequests: ZoneRequest[];
  private _bankUpdateRequests: BankUpdateRequest[];
  private _payoutStatus: PayoutStatus;

  private _documents: TechnicianDocument[];
  private _bankDetails?: TechnicianBankDetails;

  private _walletBalance: TechnicianWallet;
  private _availability: TechnicianAvailability;
  private _ratings: TechnicianRatings;

  private _verificationStatus: VerificationStatus;
  private _verificationReason?: string;

  private _isSuspended: boolean;
  private _suspendReason?: string;
  private _portfolioUrls: string[];
  private _deviceToken?: string;

  private _currentLocation?: TechnicianLocation;
  private _emergencyContact?: EmergencyContact;

  private _isOnline: boolean;
  private _isDeleted: boolean;

  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: TechnicianProps) {
    this._id = props.id || "";
    this._name = props.name;
    this._email = props.email;
    this._phone = props.phone;
    this._password = props.password;

    this._onboardingStep = props.onboardingStep || 1;
    this._experienceSummary = props.experienceSummary || "";

    this._avatarUrl = props.avatarUrl;
    this._bio = props.bio;
    this._categoryIds = props.categoryIds || [];
    this._subServiceIds = props.subServiceIds || [];
    this._zoneIds = props.zoneIds || [];

    this._serviceRequests = props.serviceRequests || [];
    this._zoneRequests = props.zoneRequests || [];
    this._bankUpdateRequests = props.bankUpdateRequests || [];
    this._payoutStatus = props.payoutStatus || "ACTIVE";

    this._documents = props.documents || [];
    this._bankDetails = props.bankDetails;

    this._walletBalance = props.walletBalance || {
      currentBalance: 0,
      frozenAmount: 0,
      currency: "INR",
    };
    this._availability = props.availability || {
      isOnline: false,
      isOnJob: false,
    };
    this._ratings = props.ratings || { averageRating: 0, totalReviews: 0 };

    this._verificationStatus = props.verificationStatus || "PENDING";
    this._verificationReason = props.verificationReason;
    this._isSuspended = props.isSuspended || false;
    this._suspendReason = props.suspendReason;
    this._portfolioUrls = props.portfolioUrls || [];
    this._deviceToken = props.deviceToken;
    this._currentLocation = props.currentLocation;
    this._emergencyContact = props.emergencyContact;
    this._isOnline = props.isOnline ?? false;
    this._isDeleted = props.isDeleted ?? false;

    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public getId(): string {
    return this._id;
  }
  public getName(): string {
    return this._name;
  }
  public getEmail(): string {
    return this._email;
  }
  public getPhone(): string {
    return this._phone;
  }
  public getPassword(): string | undefined {
    return this._password;
  }

  public getAvatarUrl(): string | undefined {
    return this._avatarUrl;
  }
  public getBio(): string | undefined {
    return this._bio;
  }
  public getOnboardingStep(): number {
    return this._onboardingStep;
  }
  public getExperienceSummary(): string {
    return this._experienceSummary;
  }

  public getCategoryIds(): string[] {
    return this._categoryIds;
  }
  public getSubServiceIds(): string[] {
    return this._subServiceIds;
  }
  public getZoneIds(): string[] {
    return this._zoneIds;
  }

  public getDocuments(): TechnicianDocument[] {
    return this._documents;
  }
  public getBankDetails(): TechnicianBankDetails | undefined {
    return this._bankDetails;
  }

  public getServiceRequests(): ServiceRequest[] {
    return this._serviceRequests;
  }
  public getZoneRequests(): ZoneRequest[] {
    return this._zoneRequests;
  }
  public getBankUpdateRequests(): BankUpdateRequest[] {
    return this._bankUpdateRequests;
  }
  public getPayoutStatus(): PayoutStatus {
    return this._payoutStatus;
  }

  public getWalletBalance(): TechnicianWallet {
    return this._walletBalance;
  }
  public getAvailability(): TechnicianAvailability {
    return this._availability;
  }
  public getRatings(): TechnicianRatings {
    return this._ratings;
  }
  public getVerificationStatus(): VerificationStatus {
    return this._verificationStatus;
  }
  public getVerificationReason(): string | undefined {
    return this._verificationReason;
  }
  public getIsSuspended(): boolean {
    return this._isSuspended;
  }
  public getSuspendReason(): string | undefined {
    return this._suspendReason;
  }
  public getPortfolioUrls(): string[] {
    return this._portfolioUrls;
  }
  public getDeviceToken(): string | undefined {
    return this._deviceToken;
  }
  public getCurrentLocation(): TechnicianLocation | undefined {
    return this._currentLocation;
  }
  public getEmergencyContact(): EmergencyContact | undefined {
    return this._emergencyContact;
  }
  public getIsDeleted(): boolean {
    return this._isDeleted;
  }
  public getCreatedAt(): Date {
    return this._createdAt;
  }
  public getUpdatedAt(): Date {
    return this._updatedAt;
  }
  public getIsOnJob(): boolean {
    return this._availability.isOnJob ?? false;
  }

  public getIsOnline(): boolean {
    return this._isOnline;
  }

  public updateProfile(data: {
    bio: string;
    experienceSummary: string;
    avatarUrl?: string;
  }) {
    if (data.bio) this._bio = data.bio;
    if (data.experienceSummary)
      this._experienceSummary = data.experienceSummary;
    if (data.avatarUrl) this._avatarUrl = data.avatarUrl;
    this._updatedAt = new Date();
  }

  public updateWorkPreferences(categoryIds: string[], subServiceIds: string[]) {
    this._categoryIds = categoryIds;
    this._subServiceIds = subServiceIds;
    this._updatedAt = new Date();
  }

  public updateZones(zoneIds: string[]) {
    this._zoneIds = zoneIds;
    this._updatedAt = new Date();
  }
  
  public dismissRequest(requestId: string): void {
    const allRequests = [
      ...this._serviceRequests,
      ...this._zoneRequests,
      ...this._bankUpdateRequests
    ];
    
    const target = allRequests.find(r => r.id === requestId);
    if (target) {
      target.isDismissed = true;
      this._updatedAt = new Date();
    }
  }

  public updateServiceRequests(requests: ServiceRequest[]): void {
    this._serviceRequests = requests;
    this._updatedAt = new Date();
  }

  public updateZoneRequests(requests: ZoneRequest[]): void {
    this._zoneRequests = requests;
    this._updatedAt = new Date();
  }

  public updateBankUpdateRequests(requests: BankUpdateRequest[]): void {
    this._bankUpdateRequests = requests;
    this._updatedAt = new Date();
  }

  public updatePayoutStatus(status: PayoutStatus): void {
    this._payoutStatus = status;
    this._updatedAt = new Date();
  }

  public updateDocuments(documents: TechnicianDocument[]) {
    this._documents = documents;
    this._updatedAt = new Date();
  }

  public updateBankDetails(details: TechnicianBankDetails) {
    this._bankDetails = details;
    this._updatedAt = new Date();
  }

  public setIsOnline(status: boolean): void {
    this._isOnline = status;
    this._updatedAt = new Date();
  }

  public setOnboardingStep(step: number): void {
    this._onboardingStep = step;
  }

  public setVerificationStatus(status: VerificationStatus): void {
    this._verificationStatus = status;
  }

  public addCategory(categoryId: string): void {
    if (!this._categoryIds.includes(categoryId)) {
      this._categoryIds.push(categoryId);
      this._updatedAt = new Date();
    }
  }
  
  public updateVerificationStatus(
    status: VerificationStatus,
    reason?: string
  ): void {
    this._verificationStatus = status;
    if (reason) {
      this._verificationReason = reason;
    }
    this._updatedAt = new Date();
  }
 
  public setSuspension(status: boolean, reason?: string): void {
    this._isSuspended = status;
    if (reason) {
      this._suspendReason = reason;
    }
    this._updatedAt = new Date();
  }
 
  public addServiceRequest(request: ServiceRequest): void {
    this._serviceRequests.push(request);
    this._updatedAt = new Date();
}

public requestBankUpdate(request: BankUpdateRequest): void {
    this._bankUpdateRequests.push(request);
    this._payoutStatus = "ON_HOLD";
    this._updatedAt = new Date();
}

  public toProps(): TechnicianProps {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      phone: this._phone,
      password: this._password,
      onboardingStep: this._onboardingStep,
      experienceSummary: this._experienceSummary,
      avatarUrl: this._avatarUrl,
      bio: this._bio,
      categoryIds: this._categoryIds,
      subServiceIds: this._subServiceIds,
      zoneIds: this._zoneIds,
      serviceRequests: this._serviceRequests,
      zoneRequests: this._zoneRequests,
      bankUpdateRequests: this._bankUpdateRequests,
      payoutStatus: this._payoutStatus,
      documents: this._documents,
      bankDetails: this._bankDetails,
      walletBalance: this._walletBalance,
      availability: this._availability,
      ratings: this._ratings,
      verificationStatus: this._verificationStatus,
      verificationReason: this._verificationReason,
      isSuspended: this._isSuspended,
      suspendReason: this._suspendReason,
      portfolioUrls: this._portfolioUrls,
      deviceToken: this._deviceToken,
      currentLocation: this._currentLocation,
      emergencyContact: this._emergencyContact,
      isOnline: this._isOnline,
      isDeleted: this._isDeleted,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
