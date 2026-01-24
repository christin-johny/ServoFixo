// src/domain/entities/Booking.ts

import {
  BookingStatus,
  BookingLocation,
  BookingPricing,
  BookingPayment,
  TechAssignmentAttempt,
  ExtraCharge,
  BookingMeta,
  BookingTimelineEvent,
  BookingTimestamps
} from "../../../../shared/types/value-objects/BookingTypes";

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
  assignmentExpiresAt?: Date; // Critical for 45s timer queries
  
  extraCharges: ExtraCharge[];
  timeline: BookingTimelineEvent[]; // Critical for disputes
  
  chatId?: string;
  meta?: BookingMeta;
  
  timestamps?: BookingTimestamps;
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
  
  private _chatId?: string;
  private _meta: BookingMeta;
  private _timestamps: BookingTimestamps;

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
    
    this._extraCharges = props.extraCharges || [];
    this._timeline = props.timeline || [];
    
    this._chatId = props.chatId;
    this._meta = props.meta || {};
    
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

  // --- Domain Methods ---

  public setCandidates(techIds: string[]): void {
     this._candidateIds = techIds;
     this._timestamps.updatedAt = new Date();
  }

  public addAssignmentAttempt(techId: string, expiresInSeconds: number = 45): void {
    if (this._status !== "REQUESTED" && this._status !== "ASSIGNED_PENDING") {
      throw new Error(`Cannot assign technician when booking is ${this._status}`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

    this._assignedTechAttempts.push({
      techId,
      attemptAt: now,
      expiresAt: expiresAt, // Redundant but good for history
      status: "PENDING",
      adminForced: false
    });

    this._assignmentExpiresAt = expiresAt; // Top-level for DB queries
    this._status = "ASSIGNED_PENDING";
    this._timestamps.updatedAt = new Date();
    
    this.addTimelineEvent("ASSIGNED_PENDING", "system", "Attempting to assign technician");
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
    this._assignmentExpiresAt = undefined; // Clear the timer
    
    this._timestamps.acceptedAt = new Date();
    this._timestamps.updatedAt = new Date();
    
    this.addTimelineEvent("ACCEPTED", `tech:${techId}`, "Technician accepted the job");
  }

  public rejectAssignment(techId: string, reason: string = "REJECTED"): void {
    const attempt = this._assignedTechAttempts.find(
      a => a.techId === techId && a.status === "PENDING"
    );

    if (attempt) {
      attempt.status = reason === "TIMEOUT" ? "TIMEOUT" : "REJECTED";
      attempt.rejectionReason = reason;
    }
    // Note: Status stays ASSIGNED_PENDING until UseCase picks next candidate or fails
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

  public addExtraCharge(charge: ExtraCharge): void {
    if (this._status !== "IN_PROGRESS" && this._status !== "EXTRAS_PENDING") {
      throw new Error("Cannot add extra charges at this stage.");
    }
    this._extraCharges.push(charge);
    this.updateStatus("EXTRAS_PENDING", `tech:${charge.addedByTechId}`, `Added charge: ${charge.title}`);
  }

  public updateExtraChargeStatus(chargeId: string, status: "APPROVED" | "REJECTED", changedBy: string): void {
    const charge = this._extraCharges.find(c => c.id === chargeId);
    if (!charge) throw new Error("Charge not found");
    
    charge.status = status;
    
    const hasPending = this._extraCharges.some(c => c.status === "PENDING");
    if (!hasPending) {
      // If all cleared, go back to IN_PROGRESS
      this.updateStatus("IN_PROGRESS", changedBy, "All extra charges resolved");
    } else {
        this._timestamps.updatedAt = new Date();
    }
  }

  public calculateFinalPrice(): void {
    let totalExtras = 0;
    this._extraCharges.forEach(charge => {
      if (charge.status === "APPROVED") totalExtras += charge.amount;
    });

    this._pricing.final = this._pricing.estimated + totalExtras + this._pricing.deliveryFee;
  }

  private addTimelineEvent(status: BookingStatus, changedBy: string, reason?: string) {
      this._timeline.push({
          status,
          changedBy,
          timestamp: new Date(),
          reason
      });
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
      meta: this._meta,
      timestamps: this._timestamps
    };
  }
}