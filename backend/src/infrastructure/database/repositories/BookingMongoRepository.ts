import { FilterQuery } from "mongoose";
import {
  IBookingRepository,
  BookingFilterParams,
  PaginatedBookingResult
} from "../../../domain/repositories/IBookingRepository";
import { Booking } from "../../../domain/entities/Booking";
import { 
  BookingDocument, 
  BookingModel 
} from "../mongoose/models/BookingModel";
import { 
  BookingStatus, 
  TechAssignmentAttempt, 
  BookingTimelineEvent 
} from "../../../../../shared/types/value-objects/BookingTypes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class BookingMongoRepository implements IBookingRepository {
  
  // --- Standard CRUD ---

  async create(booking: Booking): Promise<Booking> {
    const persistenceData = this.toPersistence(booking);
    const doc = await BookingModel.create(persistenceData);
    return this.toDomain(doc);
  }

  async update(booking: Booking): Promise<Booking> {
    const persistenceData = this.toPersistence(booking);
    const { _id, ...updateData } = persistenceData as any;

    const doc = await BookingModel.findByIdAndUpdate(
      booking.getId(),
      updateData,
      { new: true }
    ).exec();

    if (!doc) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await BookingModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).exec();
    return !!result;
  }

  async findById(id: string): Promise<Booking | null> {
    const doc = await BookingModel.findOne({
      _id: id,
      isDeleted: { $ne: true }
    }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAllPaginated(
    page: number, 
    limit: number, 
    filters: BookingFilterParams
  ): Promise<PaginatedBookingResult> {
    const query: FilterQuery<BookingDocument> = { isDeleted: { $ne: true } };

    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.technicianId) query.technicianId = filters.technicianId;
    if (filters.zoneId) query.zoneId = filters.zoneId;
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }

    // Date filtering (useful for Admin Reports)
    if (filters.startDate || filters.endDate) {
      query["timestamps.createdAt"] = {};
      if (filters.startDate) query["timestamps.createdAt"].$gte = filters.startDate;
      if (filters.endDate) query["timestamps.createdAt"].$lte = filters.endDate;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      BookingModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ "timestamps.createdAt": -1 })
        .exec(),
      BookingModel.countDocuments(query)
    ]);

    return {
      data: docs.map(doc => this.toDomain(doc)),
      total,
      page,
      limit
    };
  }

  async findActiveBookingForTechnician(technicianId: string): Promise<Booking | null> {
    const activeStatuses: BookingStatus[] = [
      "ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING"
    ];
    
    const doc = await BookingModel.findOne({
      technicianId,
      status: { $in: activeStatuses },
      isDeleted: { $ne: true }
    }).exec();

    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findActiveBookingForCustomer(customerId: string): Promise<Booking | null> {
    const activeStatuses: BookingStatus[] = [
      "REQUESTED", "ASSIGNED_PENDING", "ACCEPTED", "EN_ROUTE", 
      "REACHED", "IN_PROGRESS", "EXTRAS_PENDING"
    ];

    const doc = await BookingModel.findOne({
      customerId,
      status: { $in: activeStatuses },
      isDeleted: { $ne: true }
    }).sort({ "timestamps.createdAt": -1 }).exec();

    if (!doc) return null;
    return this.toDomain(doc);
  }

  // --- Core Booking Logic (Atomic Operations) ---

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    const update: any = { status };
    
    if (status === "IN_PROGRESS") update["timestamps.startedAt"] = new Date();
    if (status === "COMPLETED") update["timestamps.completedAt"] = new Date();
    if (status === "CANCELLED") update["timestamps.cancelledAt"] = new Date();
    update["timestamps.updatedAt"] = new Date();

    await BookingModel.findByIdAndUpdate(id, { $set: update }).exec();
  }

  /**
   * Adds a new candidate attempt and starts the timer.
   * Maps to Section 5.6 of PDF.
   */
  async addAssignmentAttempt(id: string, attempt: TechAssignmentAttempt): Promise<void> {
    await BookingModel.findByIdAndUpdate(id, {
      $push: { assignedTechAttempts: attempt },
      $set: { 
        status: "ASSIGNED_PENDING", 
        assignmentExpiresAt: attempt.expiresAt, // Critical for Cron Job
        "timestamps.updatedAt": new Date() 
      }
    }).exec();
  }

  /**
   * ATOMIC LOCK: Prevents Race Conditions (PDF Section 5.8).
   * Only assigns if the booking is still pending and the attempt matches.
   */
  async assignTechnician(bookingId: string, technicianId: string): Promise<boolean> {
    const result = await BookingModel.findOneAndUpdate(
      {
        _id: bookingId,
        status: "ASSIGNED_PENDING",
        // Ensure we are confirming the *current* pending attempt for *this* technician
        "assignedTechAttempts": { 
          $elemMatch: { techId: technicianId, status: "PENDING" } 
        }
      },
      {
        $set: {
          technicianId: technicianId,
          status: "ACCEPTED",
          assignmentExpiresAt: null, // Clear the timer
          "timestamps.acceptedAt": new Date(),
          "timestamps.updatedAt": new Date(),
          // Mark the specific attempt as ACCEPTED
          "assignedTechAttempts.$[elem].status": "ACCEPTED"
        }
      },
      {
        new: true,
        // Filter to identify which array element to update
        arrayFilters: [{ "elem.techId": technicianId, "elem.status": "PENDING" }]
      }
    ).exec();

    return !!result;
  }

  async updateExtraChargeStatus(
    bookingId: string, 
    chargeId: string, 
    status: "APPROVED" | "REJECTED"
  ): Promise<void> {
    const result = await BookingModel.updateOne(
      { _id: bookingId, "extraCharges._id": chargeId },
      {
        $set: {
          "extraCharges.$.status": status,
          "timestamps.updatedAt": new Date()
        }
      }
    ).exec();

    if (result.matchedCount === 0) {
      throw new Error("Booking or Charge not found");
    }
  }

  async updatePaymentStatus(
    bookingId: string, 
    status: "PAID" | "FAILED", 
    transactionId?: string
  ): Promise<void> {
    const update: any = { 
      "payment.status": status,
      "timestamps.updatedAt": new Date()
    };
    if (transactionId) update["payment.transactionId"] = transactionId;

    await BookingModel.findByIdAndUpdate(bookingId, { $set: update }).exec();
  }

  // --- Internal Private Mappers (DB <-> Domain) ---

  private toDomain(doc: BookingDocument): Booking {
    if (!doc) throw new Error("Booking document is undefined");

    const attempts = (doc.assignedTechAttempts || []).map(a => ({
      techId: a.techId,
      attemptAt: a.attemptAt,
      expiresAt: a.expiresAt,
      status: a.status,
      adminForced: a.adminForced,
      rejectionReason: a.rejectionReason
    }));

    const charges = (doc.extraCharges || []).map((c: any) => ({
      id: c._id ? c._id.toString() : "",
      title: c.title,
      amount: c.amount,
      description: c.description,
      proofUrl: c.proofUrl,
      status: c.status,
      addedByTechId: c.addedByTechId,
      addedAt: c.addedAt
    }));

    const timeline = (doc.timeline || []).map((t: any) => ({
      status: t.status,
      changedBy: t.changedBy,
      timestamp: t.timestamp,
      reason: t.reason,
      meta: t.meta
    }));

    return new Booking({
      id: doc._id.toString(),
      customerId: doc.customerId,
      technicianId: doc.technicianId,
      serviceId: doc.serviceId,
      zoneId: doc.zoneId,
      status: doc.status,
      location: doc.location,
      pricing: doc.pricing,
      payment: doc.payment,
      candidateIds: doc.candidateIds || [],
      assignedTechAttempts: attempts,
      assignmentExpiresAt: doc.assignmentExpiresAt,
      extraCharges: charges,
      timeline: timeline,
      chatId: doc.chatId,
      meta: doc.meta,
      timestamps: doc.timestamps
    });
  }

  private toPersistence(entity: Booking): Partial<BookingDocument> {
    const props = entity.toProps();

    return {
      customerId: props.customerId,
      technicianId: props.technicianId || undefined,
      serviceId: props.serviceId,
      zoneId: props.zoneId,
      status: props.status,
      location: props.location,
      pricing: props.pricing,
      payment: props.payment,
      
      candidateIds: props.candidateIds,
      assignmentExpiresAt: props.assignmentExpiresAt,

      assignedTechAttempts: props.assignedTechAttempts.map(a => ({
        techId: a.techId,
        attemptAt: a.attemptAt,
        expiresAt: a.expiresAt, // Removed comma here
        status: a.status,
        adminForced: a.adminForced || false,
        rejectionReason: a.rejectionReason
      })),

      extraCharges: props.extraCharges.map(c => ({
        _id: c.id, 
        title: c.title,
        amount: c.amount,
        description: c.description,
        proofUrl: c.proofUrl,
        status: c.status,
        addedByTechId: c.addedByTechId,
        addedAt: c.addedAt
      })) as any,

      timeline: props.timeline.map(t => ({
        status: t.status,
        changedBy: t.changedBy,
        timestamp: t.timestamp,
        reason: t.reason,
        meta: t.meta
      })),

      chatId: props.chatId,
      meta: props.meta,
      timestamps: props.timestamps,
      isDeleted: false
    };
  }
}