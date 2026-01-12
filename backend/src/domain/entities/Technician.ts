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
  RequestStatus,
  BankUpdateRequest,
  PayoutStatus,
} from "../../../../shared/types/value-objects/TechnicianTypes";

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

  // ✅ NEW: Request Arrays
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
  requestBankUpdate: any;

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

  // ... (Existing Getters)
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
  public getOnboardingStep(): number {
    return this._onboardingStep;
  }
  public getExperienceSummary(): string {
    return this._experienceSummary;
  }
  public getAvatarUrl(): string | undefined {
    return this._avatarUrl;
  }
  public getBio(): string | undefined {
    return this._bio;
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
  public getVerificationStatus(): VerificationStatus {
    return this._verificationStatus;
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
  public getIsOnline(): boolean {
    return this._isOnline;
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

  // ✅ NEW: Request Getters
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
  public getIsOnJob(): boolean {
    return this._availability.isOnJob;
  }

  // ... (Existing Setters)
  public setOnboardingStep(step: number): void {
    this._onboardingStep = step;
  }
  public setVerificationStatus(status: VerificationStatus): void {
    this._verificationStatus = status;
  }
  public updateVerificationStatus(
    status: VerificationStatus,
    reason?: string
  ): void {
    this._verificationStatus = status;
    if (reason) this._verificationReason = reason;
    this._updatedAt = new Date();
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
  public setSuspension(status: boolean, reason?: string): void {
    this._isSuspended = status;
    this._suspendReason = reason;
    this._updatedAt = new Date();
  }

  // ✅ NEW: Logic to Add a Service Request
  public addServiceRequest(request: ServiceRequest): void {
    // 1. Validation: Cannot request what you already have active
    if (this._subServiceIds.includes(request.serviceId)) {
      throw new Error("This service is already active in your profile.");
    }

    // 2. Validation: Cannot have a duplicate PENDING request
    const existingPending = this._serviceRequests.find(
      (r) => r.serviceId === request.serviceId && r.status === "PENDING"
    );
    if (existingPending) {
      throw new Error(
        "A request for this service is already pending approval."
      );
    }

    this._serviceRequests.push(request);
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
