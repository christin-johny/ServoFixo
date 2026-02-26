import type { ClientSession } from "mongoose";
import type { FilterQuery } from "mongoose";
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
  ExtraCharge,
  PaymentStatus
} from "../../../domain/value-objects/BookingTypes";
import { ErrorMessages } from "../../../application/constants/ErrorMessages";
import { isValidObjectId } from "mongoose";


export class BookingMongoRepository implements IBookingRepository {
   

  async create(booking: Booking): Promise<Booking> {
    const persistenceData = this.toPersistence(booking);
    const doc = await BookingModel.create(persistenceData);
    return this.toDomain(doc);
  }

  async update(booking: Booking): Promise<Booking> {
    const persistenceData = this.toPersistence(booking);
    const {  ...updateData } = persistenceData as any;

    const doc = await BookingModel.findByIdAndUpdate(
      booking.getId(),
      updateData,
      { new: true }
    ).exec();

    if (!doc) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
    return this.toDomain(doc);
  }
  async getTechnicianEarnings(technicianId: string): Promise<number> {
    const result = await BookingModel.aggregate([
      { 
        $match: { 
          technicianId, 
          status: { $in: ["PAID", "COMPLETED"] }, 
          isDeleted: false 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$pricing.final" } 
        } 
      }
    ]).exec();

    return result[0]?.total || 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await BookingModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).exec();
    return !!result;
  }
  async markAsRated(bookingId: string): Promise<void> {
      await BookingModel.findByIdAndUpdate(bookingId, {
          $set: { 
              isRated: true,
              "timestamps.updatedAt": new Date()
          }
      }).exec();
  }

  async findById(id: string, session?: ClientSession): Promise<Booking | null> {
    const doc = await BookingModel.findOne({
      _id: id,
      isDeleted: { $ne: true }
    }) .session(session || null) 
    .exec();

    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByPaymentOrderId(orderId: string, session?: ClientSession): Promise<Booking | null> {
    const doc = await BookingModel.findOne({
      "payment.razorpayOrderId": orderId,
      isDeleted: { $ne: true }
    })
    .session(session || null)
    .exec();

    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAllPaginated(
    page: number, 
    limit: number, 
    filters: BookingFilterParams
  ): Promise<PaginatedBookingResult> {
    const query: FilterQuery<BookingDocument> = { isDeleted: { $ne: true } };

    // 1. Existing Filters (Preserved)
    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.technicianId) query.technicianId = filters.technicianId;
    if (filters.zoneId) query.zoneId = filters.zoneId;
    
    // 2. Status Filter
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }

    // 3. Date Range Filter
    if (filters.startDate || filters.endDate) {
      query["timestamps.createdAt"] = {};
      if (filters.startDate) query["timestamps.createdAt"].$gte = filters.startDate;
      if (filters.endDate) query["timestamps.createdAt"].$lte = filters.endDate;
    }

    // 4.   NEW: Category Filter (Using Snapshots)
    if (filters.categoryId) {
        query["snapshots.service.categoryId"] = filters.categoryId;
    }

    // 5.   ENHANCED: Search Logic (Service, Customer, or Technician Name)
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      const orConditions: any[] = [
        { "snapshots.service.name": searchRegex },
        { "snapshots.customer.name": searchRegex },    // New: Search by Customer
        { "snapshots.technician.name": searchRegex }   // New: Search by Tech
      ];
      
      if (isValidObjectId(filters.search)) {
        orConditions.push({ _id: filters.search });
      }
      query.$or = orConditions;
    }

    // 6.   NEW: Dynamic Sorting Logic
    let sort: any = { "timestamps.createdAt": -1 }; // Default: Newest first

    if (filters.sortBy === "oldest") {
        sort = { "timestamps.createdAt": 1 };
    } else if (filters.sortBy === "updated") {
        sort = { "timestamps.updatedAt": -1 };
    }

    const skip = (page - 1) * limit;
    
    const [docs, total] = await Promise.all([
      BookingModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort) 
        .exec(),
      BookingModel.countDocuments(query)
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      data: docs.map(doc => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async findActiveBookingForTechnician(technicianId: string): Promise<Booking | null> {
    const activeStatuses: BookingStatus[] = [
      "ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING","COMPLETED"
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
      "REACHED", "IN_PROGRESS", "EXTRAS_PENDING",'COMPLETED'
    ]; 
    const doc = await BookingModel.findOne({
      customerId,
      status: { $in: activeStatuses },
      isDeleted: { $ne: true }
    }).sort({ "timestamps.createdAt": -1 }).exec();

    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findExpiredAssignments(): Promise<Booking[]> {
    const now = new Date();
    const docs = await BookingModel.find({
      status: "ASSIGNED_PENDING",
      assignmentExpiresAt: { $lte: now },
      isDeleted: { $ne: true }
    }).exec();

    return docs.map(doc => this.toDomain(doc));
  }
 

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    const update: any = { status };
    if (status === "IN_PROGRESS") update["timestamps.startedAt"] = new Date();
    if (status === "COMPLETED") update["timestamps.completedAt"] = new Date();
    if (status === "CANCELLED") update["timestamps.cancelledAt"] = new Date();
    update["timestamps.updatedAt"] = new Date();

    await BookingModel.findByIdAndUpdate(id, { $set: update }).exec();
  }

  async addAssignmentAttempt(id: string, attempt: TechAssignmentAttempt): Promise<void> {
    await BookingModel.findByIdAndUpdate(id, {
      $push: { assignedTechAttempts: attempt },
      $set: { 
        status: "ASSIGNED_PENDING", 
        assignmentExpiresAt: attempt.expiresAt,
        "timestamps.updatedAt": new Date() 
      }
    }).exec();
  }

  async assignTechnician(
    bookingId: string,
    technicianId: string,
    techSnapshot: { name: string; phone: string; avatarUrl?: string; rating: number }
  ): Promise<boolean> {
    const result = await BookingModel.findOneAndUpdate(
      {
        _id: bookingId,
        status: "ASSIGNED_PENDING",
        assignedTechAttempts: { $elemMatch: { techId: technicianId, status: "PENDING" } }
      },
      {
        $set: {
          technicianId,
          status: "ACCEPTED",
          assignmentExpiresAt: null,
          "timestamps.acceptedAt": new Date(),
          "assignedTechAttempts.$[elem].status": "ACCEPTED",
          "snapshots.technician": techSnapshot
        }
      },
      {
        new: true,
        arrayFilters: [{ "elem.techId": technicianId, "elem.status": "PENDING" }]
      }
    ).exec();
    return Boolean(result);
  }
  async getAdminBookingStats(): Promise<{ revenue: number; statusCounts: Record<string, number> }> {
  const result = await BookingModel.aggregate([
    {
      $facet: {
        "revenue": [
          { $match: { status: { $in: ["PAID", "COMPLETED"] }, isDeleted: false } },
          { $group: { _id: null, total: { $sum: "$pricing.final" } } }
        ],
        "counts": [
          { $match: { isDeleted: false } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]
      }
    }
  ]).exec();

  const revenue = result[0].revenue[0]?.total || 0;
  const statusCounts = result[0].counts.reduce((acc: any, curr: any) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return { revenue, statusCounts };
}

  async updateExtraChargeStatus(
    bookingId: string, 
    chargeId: string, 
    status: "APPROVED" | "REJECTED"
  ): Promise<void> { 
    const result = await BookingModel.updateOne(
      { _id: bookingId, "extraCharges.id": chargeId }, 
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

async updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string): Promise<void> {
    const updatePayload: any = {
      "payment.status": status,
      updatedAt: new Date()
    };

    if (transactionId) {
      updatePayload["payment.transactionId"] = transactionId;
    }
 
    if (status === 'PAID') {
        updatePayload["status"] = "PAID";
    }

    await BookingModel.findByIdAndUpdate(id, { $set: updatePayload }).exec();
}

async addExtraCharge(bookingId: string, charge: ExtraCharge): Promise<ExtraCharge> {
    const chargeData = { 
      title: charge.title,
      amount: charge.amount,
      description: charge.description,
      proofUrl: charge.proofUrl,
      status: charge.status,
      addedByTechId: charge.addedByTechId,
      addedAt: charge.addedAt
    };

    const result = await BookingModel.findOneAndUpdate(
      { _id: bookingId },
      {
        $push: { extraCharges: chargeData },
        $set: { 
          status: "EXTRAS_PENDING", 
          "timestamps.updatedAt": new Date() 
        }
      },
      { new: true }  
    ).exec();

    if (!result) throw new Error("Booking not found");
 
    const addedItem = result.extraCharges[result.extraCharges.length - 1] as any;

    if (!addedItem) throw new Error("Failed to add charge");
 
    return {
        id: addedItem._id.toString(),  
        title: addedItem.title,
        amount: addedItem.amount,
        description: addedItem.description,
        proofUrl: addedItem.proofUrl,
        status: addedItem.status,
        addedByTechId: addedItem.addedByTechId,
        addedAt: addedItem.addedAt
    };
  }
  
  private toDomain(doc: BookingDocument): Booking {
    if (!doc) throw new Error("Booking document is undefined");

    const attempts = (doc.assignedTechAttempts || []).map(a => ({
      techId: a.techId,
      attemptAt: a.attemptAt,
      expiresAt: a.expiresAt,
      status: a.status as TechAssignmentAttempt["status"], 
      adminForced: a.adminForced,
      rejectionReason: a.rejectionReason
    }));

    const charges = (doc.extraCharges || []).map((c: any) => ({
      id: c.id || c._id?.toString(),  
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
      isRated: doc.isRated || false,
      completionPhotos: doc.completionPhotos || [],
      chatId: doc.chatId,
      meta: doc.meta,
      timestamps: doc.timestamps,
      snapshots: {
        technician: doc.snapshots?.technician,
        customer: doc.snapshots?.customer || { name: "Unknown", phone: "" },
        service: doc.snapshots?.service || { name: "Unknown", categoryId: "" }
      }
    });
  }

  private toPersistence(entity: Booking): Partial<BookingDocument> {
    const props = entity.toProps();
    const snapshots = props.snapshots || {
      customer: { name: "Unknown", phone: "" },
      service: { name: "Unknown", categoryId: "" }
    };

    return {
      customerId: props.customerId,
      technicianId: props.technicianId || undefined,
      serviceId: props.serviceId,
      zoneId: props.zoneId,
      status: props.status,
      location: props.location,
      pricing: props.pricing,
      payment: props.payment,
      isRated: props.isRated,
      candidateIds: props.candidateIds,
      assignmentExpiresAt: props.assignmentExpiresAt,
      assignedTechAttempts: props.assignedTechAttempts.map(a => ({
        techId: a.techId,
        attemptAt: a.attemptAt,
        expiresAt: a.expiresAt,
        status: a.status,
        adminForced: a.adminForced || false,
        rejectionReason: a.rejectionReason
      })),
      extraCharges: props.extraCharges.map(c => ({
        id: c.id,  
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
      completionPhotos: props.completionPhotos,
      snapshots: {
        technician: snapshots.technician,
        customer: snapshots.customer,
        service: snapshots.service
      },
      chatId: props.chatId,
      meta: props.meta,
      timestamps: props.timestamps,
      isDeleted: false
    };
  }
}