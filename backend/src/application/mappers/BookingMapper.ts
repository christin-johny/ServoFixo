import { Booking } from "../../domain/entities/Booking";
import { BookingResponseDto } from "../dto/booking/BookingResponseDto";
import { S3UrlHelper } from "../../infrastructure/storage/S3UrlHelper"; //

export class BookingMapper {
  static async toResponse(entity: Booking): Promise<BookingResponseDto> {
    const snapshots = entity.getSnapshots();

    // 1. Resolve Private Completion Photos (Signed)
    const resolvedCompletionPhotos = await Promise.all(
      (entity.getCompletionPhotos() || []).map(async (key) => 
        await S3UrlHelper.getPrivateUrl(key)
      )
    );

    // 2. Resolve Private Extra Charge Proofs (Signed)
    const resolvedExtraCharges = await Promise.all(
      entity.getExtraCharges().map(async (charge) => ({
        ...charge,
        proofUrl: charge.proofUrl ? await S3UrlHelper.getPrivateUrl(charge.proofUrl) : undefined
      }))
    );

    return {
      id: entity.getId(),
      customerId: entity.getCustomerId(),
      technicianId: entity.getTechnicianId(),
      serviceId: entity.getServiceId(),
      zoneId: entity.getZoneId(),
      status: entity.getStatus(),
      
      location: entity.getLocation(),
      pricing: entity.getPricing(),
      payment: entity.getPayment(),
      
      candidateIds: entity.getCandidateIds(),
      assignedTechAttempts: entity.getAttempts(),
      extraCharges: resolvedExtraCharges,
      completionPhotos: resolvedCompletionPhotos,
      timeline: entity.getTimeline(),
      isRated: entity.getIsRated(),
      chatId: entity.getChatId(),
       
      snapshots: {
        ...snapshots,
        customer: {
          ...snapshots.customer,
          avatarUrl: S3UrlHelper.getFullUrl(snapshots.customer.avatarUrl) // Public
        },
        technician: snapshots.technician ? {
          ...snapshots.technician,
          avatarUrl: S3UrlHelper.getFullUrl(snapshots.technician.avatarUrl) // Public
        } : undefined,
        service: snapshots.service
      },
      
      meta: entity.getMeta(),
      timestamps: entity.getTimestamps()
    };
  }
  static toDomain(raw: any): Booking {
    if (!raw) throw new Error("Booking data is null/undefined");
    
    const attempts = (raw.assignedTechAttempts || []).map((a: any) => ({
      techId: a.techId,
      attemptAt: a.attemptAt ? new Date(a.attemptAt) : new Date(),
      expiresAt: a.expiresAt ? new Date(a.expiresAt) : new Date(),
      status: a.status,
      adminForced: !!a.adminForced,
      rejectionReason: a.rejectionReason
    }));

    const charges = (raw.extraCharges || []).map((c: any) => ({
      id: c.id || c._id?.toString(),
      title: c.title,
      amount: c.amount,
      description: c.description,
      proofUrl: c.proofUrl,
      status: c.status,
      addedByTechId: c.addedByTechId,
      addedAt: c.addedAt ? new Date(c.addedAt) : new Date()
    }));

    const timeline = (raw.timeline || []).map((t: any) => ({
      status: t.status,
      changedBy: t.changedBy,
      timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
      reason: t.reason,
      meta: t.meta
    }));

    return new Booking({
        id: raw.id || raw._id?.toString(),
        customerId: raw.customerId,
        technicianId: raw.technicianId || null,
        serviceId: raw.serviceId,
        zoneId: raw.zoneId,
        
        status: raw.status,
        
        location: raw.location,
        pricing: raw.pricing,
        payment: raw.payment || { status: "PENDING" },
        isRated: raw.isRated || false,
        candidateIds: raw.candidateIds || [],
        assignedTechAttempts: attempts,
        assignmentExpiresAt: raw.assignmentExpiresAt ? new Date(raw.assignmentExpiresAt) : undefined,
        
        extraCharges: charges,
        timeline: timeline,
        chatId: raw.chatId,
        completionPhotos: raw.completionPhotos || [],
         
        snapshots: raw.snapshots ? {
            technician: raw.snapshots.technician,
            customer: raw.snapshots.customer,
            service: raw.snapshots.service
        } : undefined,
        
        meta: raw.meta || {},
        timestamps: {
            createdAt: raw.timestamps?.createdAt || raw.createdAt || new Date(),
            scheduledAt: raw.timestamps?.scheduledAt ? new Date(raw.timestamps.scheduledAt) : undefined,
            updatedAt: raw.timestamps?.updatedAt || raw.updatedAt || new Date(),
            acceptedAt: raw.timestamps?.acceptedAt,
            startedAt: raw.timestamps?.startedAt,
            completedAt: raw.timestamps?.completedAt,
            cancelledAt: raw.timestamps?.cancelledAt,
        }
    });
  }
}