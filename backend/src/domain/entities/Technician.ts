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
  documents: any[];
  bankDetails?: any;

  walletBalance?: any;
  availability?: any;
  ratings?: any;

  verificationStatus?: string;
  verificationReason?: string;
  isSuspended?: boolean;
  suspendReason?: string;
  portfolioUrls?: string[];
  deviceToken?: string;
  currentLocation?: any;
  emergencyContact?: any;
  isOnline?: boolean;

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
  private _documents: any[];
  private _bankDetails?: any;

  private _walletBalance: any;
  private _availability: any;
  private _ratings: any;

  private _verificationStatus: string;
  private _verificationReason?: string;
  private _isSuspended: boolean;
  private _suspendReason?: string;
  private _portfolioUrls: string[];
  private _deviceToken?: string;
  private _currentLocation?: any;
  private _emergencyContact?: any;
  private _isOnline: boolean;
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
    this._documents = props.documents || [];
    this._bankDetails = props.bankDetails;

    this._walletBalance = props.walletBalance || {
      currentBalance: 0,
      frozenAmount: 0,
      currency: "INR",
    };
    this._availability = props.availability || { isOnline: false };
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
  public getDocuments(): any[] {
    return this._documents;
  }
  public getBankDetails(): any {
    return this._bankDetails;
  }
  public getVerificationStatus(): string {
    return this._verificationStatus;
  }

  public getWalletBalance(): any {
    return this._walletBalance;
  }
  public getAvailability(): any {
    return this._availability;
  }
  public getRatings(): any {
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
  public getCurrentLocation(): any {
    return this._currentLocation;
  }
  public getEmergencyContact(): any {
    return this._emergencyContact;
  }
  public getIsOnline(): boolean {
    return this._isOnline;
  }
  public getCreatedAt(): Date {
    return this._createdAt;
  }
  public getUpdatedAt(): Date {
    return this._updatedAt;
  }
 
  public setOnboardingStep(step: number): void {
    this._onboardingStep = step;
  }

  public setVerificationStatus(status: string): void {
    this._verificationStatus = status;
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

  public updateDocuments(documents: any[]) {
    this._documents = documents;
    this._updatedAt = new Date();
  }

  public updateBankDetails(details: any) {
    this._bankDetails = details;
    this._updatedAt = new Date();
  }
  public setIsOnline(status: boolean): void {
    this._isOnline = status;
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
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
