import {
  BookingStatus,
  BookingLocation,
  BookingPricing,
  BookingPayment,
  TechAssignmentAttempt,
  ExtraCharge,
  BookingMeta,
  BookingTimelineEvent,
  BookingTimestamps,
  BookingSnapshots
} from "../value-objects/BookingTypes";

export interface BookingProps {
  id?: string;
  customerId: string;
  technicianId?: string | null;
  serviceId: string;
  zoneId: string;
  
  status: BookingStatus;
  
  location: BookingLocation;
  pricing: BookingPricing;
  payment: BookingPayment;
  
  candidateIds: string[]; 
  assignedTechAttempts: TechAssignmentAttempt[];
  assignmentExpiresAt?: Date;  
  completionPhotos?: string[];
  extraCharges: ExtraCharge[];
  timeline: BookingTimelineEvent[]; 
  isRated?: boolean;
  chatId?: string;
  meta?: BookingMeta;
  
  timestamps?: BookingTimestamps;
  snapshots?: BookingSnapshots;
}

export class Booking {
  private _id: string;
  private _customerId: string;
  private _technicianId: string | null;
  private _serviceId: string;
  private _zoneId: string;
  
  private _status: BookingStatus;
  
  private _location: BookingLocation;
  private _pricing: BookingPricing;
  private _payment: BookingPayment;
  
  private _candidateIds: string[];
  private _assignedTechAttempts: TechAssignmentAttempt[];
  private _assignmentExpiresAt?: Date;
  
  private _extraCharges: ExtraCharge[];
  private _timeline: BookingTimelineEvent[];
  private _completionPhotos: string[];
  private _chatId?: string;
  private _meta: BookingMeta;
  private _timestamps: BookingTimestamps;
  private _snapshots: BookingSnapshots;
  private _isRated: boolean;

  constructor(props: BookingProps) {
    this._id = props.id || "";
    this._customerId = props.customerId;
    this._technicianId = props.technicianId || null;
    this._serviceId = props.serviceId;
    this._zoneId = props.zoneId;
    
    this._status = props.status || "REQUESTED";
    
    this._location = props.location;
    this._pricing = props.pricing;
    this._payment = props.payment || { status: "PENDING" };
    
    this._candidateIds = props.candidateIds || [];
    this._assignedTechAttempts = props.assignedTechAttempts || [];
    this._assignmentExpiresAt = props.assignmentExpiresAt;

    this._completionPhotos = props.completionPhotos || [];
    this._extraCharges = props.extraCharges || [];
    this._timeline = props.timeline || [];
    this._isRated = props.isRated || false;
    this._chatId = props.chatId;
    this._meta = props.meta || {};
    this._snapshots = props.snapshots || {
      customer: { name: "", phone: "" },
      service: { name: "", categoryId: "" }
    };
    
    this._timestamps = props.timestamps || {
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // --- Getters ---
  public getId(): string { return this._id; }
  public getCustomerId(): string { return this._customerId; }
  public getTechnicianId(): string | null { return this._technicianId; }
  public getServiceId(): string { return this._serviceId; }
  public getZoneId(): string { return this._zoneId; }
  public getStatus(): BookingStatus { return this._status; }
  public getLocation(): BookingLocation { return this._location; }
  public getPricing(): BookingPricing { return this._pricing; }
  public getPayment(): BookingPayment { return this._payment; }
  public getCandidateIds(): string[] { return this._candidateIds; }
  public getAttempts(): TechAssignmentAttempt[] { return this._assignedTechAttempts; }
  public getAssignmentExpiresAt(): Date | undefined { return this._assignmentExpiresAt; }
  public getExtraCharges(): ExtraCharge[] { return this._extraCharges; }
  public getTimeline(): BookingTimelineEvent[] { return this._timeline; }
  public getChatId(): string | undefined { return this._chatId; }
  public getMeta(): BookingMeta { return this._meta; }
  public getTimestamps(): BookingTimestamps { return this._timestamps; }
  public getSnapshots(): BookingSnapshots { return this._snapshots; }
  public getCompletionPhotos(): string[] { return this._completionPhotos; } 
  public getIsRated(): boolean { return this._isRated; }

  
  public markAsRated(): void {
      this._isRated = true;
      this._timestamps.updatedAt = new Date();
  }

  public setCandidates(techIds: string[]): void {
     this._candidateIds = techIds;
     this._timestamps.updatedAt = new Date();
  }

  public addAssignmentAttempt(techId: string, expiresInSeconds: number = 60): void {
    if (this._status !== "REQUESTED" && this._status !== "ASSIGNED_PENDING") {
      throw new Error(`Cannot assign technician when booking is ${this._status}`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

    this._assignedTechAttempts.push({
      techId,
      attemptAt: now,
      expiresAt: expiresAt, 
      status: "PENDING",
      adminForced: false
    });

    this._assignmentExpiresAt = expiresAt; 
    this._status = "ASSIGNED_PENDING";
    this._timestamps.updatedAt = new Date();
    
    this.addTimelineEvent("ASSIGNED_PENDING", "system", "Attempting to assign technician");
  }
  public addCompletionPhoto(url: string): void {
      this._completionPhotos.push(url);
      this._timestamps.updatedAt = new Date();
  }

  public handleAssignmentTimeout(): void { 
      const pendingAttempt = this._assignedTechAttempts.find(a => a.status === "PENDING");
      if (pendingAttempt) {
          pendingAttempt.status = "TIMEOUT";
      } 
  }

  public acceptAssignment(techId: string): void {
    if (this._status !== "ASSIGNED_PENDING" && this._status !== "REQUESTED") {
      throw new Error("Booking is not pending assignment.");
    }

    const attempt = this._assignedTechAttempts.find(
      a => a.techId === techId && a.status === "PENDING"
    );

    if (attempt) {
      attempt.status = "ACCEPTED";
    }

    this._technicianId = techId;
    this._status = "ACCEPTED";
    this._assignmentExpiresAt = undefined;  
    
    this._timestamps.acceptedAt = new Date();
    this._timestamps.updatedAt = new Date();
    
    this.addTimelineEvent("ACCEPTED", `tech:${techId}`, "Technician accepted the job");
  } 

  public setOtp(otp: string): void {
    if (!this._meta) {
        this._meta = {};
    } 
    this._meta.otp = otp;
    this._timestamps.updatedAt = new Date();
  }

  public adminForceAssign(
      techId: string, 
      snapshot: { 
          tech: { name: string; phone: string; avatarUrl?: string; rating: number };
          adminName: string 
      }
  ): void { 
    this._status = "ACCEPTED";
    this._technicianId = techId;
    this._assignmentExpiresAt = undefined;
    this._candidateIds = []; 
     
    this.setTechnicianSnapshot(snapshot.tech);
 
    this._timestamps.acceptedAt = new Date();
    this._timestamps.updatedAt = new Date();
     
    this._assignedTechAttempts.forEach(a => {
        if (a.status === "PENDING") {
            a.status = "CANCELLED_BY_SYSTEM";
            a.rejectionReason = "Admin forced new assignment";
        }
    });
 
    this.addTimelineEvent(
        "ACCEPTED", 
        `admin:${snapshot.adminName}`, 
        "Admin forced assignment"
    );
  }

  public adminForceStatus(status: BookingStatus, adminId: string, reason: string): void {
      this.updateStatus(status, `admin:${adminId}`, reason);
  }

  public setTechnicianId(techId: string | null): void {
    this._technicianId = techId;
    this._timestamps.updatedAt = new Date();
  }
 
  public rejectAssignment(techId: string, reason: string = "REJECTED"): void { 
    const attempt = this._assignedTechAttempts.find(
      a => a.techId === techId && (a.status === "PENDING" || a.status === "ACCEPTED")
    );

    if (attempt) { 
      const newStatus = attempt.status === "ACCEPTED" ? "CANCELLED_BY_TECH" : "REJECTED";
      attempt.status = reason === "TIMEOUT" ? "TIMEOUT" : newStatus;
      attempt.rejectionReason = reason;
    }
     
    if (this._technicianId === techId) {
        this._technicianId = null;
        this._status = "REQUESTED"; 
    }

    this._timestamps.updatedAt = new Date();
  }
  
  public updateStatus(newStatus: BookingStatus, changedBy: string, reason?: string): void {
    this._status = newStatus;
    
    if (newStatus === "IN_PROGRESS") this._timestamps.startedAt = new Date();
    if (newStatus === "COMPLETED") this._timestamps.completedAt = new Date();
    if (newStatus === "CANCELLED") this._timestamps.cancelledAt = new Date();
    
    this._timestamps.updatedAt = new Date();
    this.addTimelineEvent(newStatus, changedBy, reason);
  }

  //   CRITICAL FIX: Allow adding charges in other active statuses
  public addExtraCharge(charge: ExtraCharge): void { 
    const allowedStatuses = ["ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING"];
    
    if (!allowedStatuses.includes(this._status)) {
      throw new Error(`Cannot add extra charges when status is ${this._status}`);
    }

    this._extraCharges.push(charge);
    this.updateStatus("EXTRAS_PENDING", `tech:${charge.addedByTechId}`, `Added charge: ${charge.title}`);
  }

  //   Logic to update status and auto-resume to IN_PROGRESS
  public updateExtraChargeStatus(chargeId: string, status: "APPROVED" | "REJECTED", changedBy: string): void {
    const charge = this._extraCharges.find(c => c.id === chargeId);
    if (!charge) throw new Error("Charge not found");
    
    charge.status = status;
    
    const hasPending = this._extraCharges.some(c => c.status === "PENDING");
    
    // Logic: If we are in 'EXTRAS_PENDING' and all charges are resolved, resume to 'IN_PROGRESS'
    if (!hasPending && this._status === 'EXTRAS_PENDING') {
      this.updateStatus("IN_PROGRESS", changedBy, "All extra charges resolved");
    } else {
        this._timestamps.updatedAt = new Date();
        this.addTimelineEvent("EXTRAS_PENDING", changedBy, `Charge ${status.toLowerCase()}`);
    }
  }

  public calculateFinalPrice(): void {
    const basePrice = this._pricing.estimated || 0;
    const delivery = this._pricing.deliveryFee || 0;
    const discount = this._pricing.discount || 0;
    const tax = this._pricing.tax || 0;
 
    const extrasTotal = this._extraCharges
      .filter((c) => c.status === "APPROVED")
      .reduce((sum, c) => sum + c.amount, 0);
 
    this._pricing.final = basePrice + delivery + extrasTotal + tax - discount;
  }

  private addTimelineEvent(status: BookingStatus, changedBy: string, reason?: string) {
      this._timeline.push({
          status,
          changedBy,
          timestamp: new Date(),
          reason
      });
  }

  public setInitialSnapshots(
    customer: { name: string; phone: string; avatarUrl?: string },
    service: { name: string; categoryId: string }
  ): void {
    this._snapshots.customer = customer;
    this._snapshots.service = service;
  }

  public setTechnicianSnapshot(tech: { 
    name: string; 
    phone: string; 
    avatarUrl?: string; 
    rating: number;
  }): void {
    this._snapshots.technician = tech;
  }

  public toProps(): BookingProps {
    return {
      id: this._id,
      customerId: this._customerId,
      technicianId: this._technicianId,
      serviceId: this._serviceId,
      zoneId: this._zoneId,
      status: this._status,
      location: this._location,
      pricing: this._pricing,
      payment: this._payment,
      candidateIds: this._candidateIds,
      assignedTechAttempts: this._assignedTechAttempts,
      assignmentExpiresAt: this._assignmentExpiresAt,
      extraCharges: this._extraCharges,
      timeline: this._timeline,
      chatId: this._chatId,
      completionPhotos: this._completionPhotos,
      meta: this._meta,
      timestamps: this._timestamps,
      isRated: this._isRated,
      snapshots: this._snapshots,
    };
  }
}