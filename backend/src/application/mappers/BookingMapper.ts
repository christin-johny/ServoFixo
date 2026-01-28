import { Booking } from "../../domain/entities/Booking";
import { BookingResponseDto } from "../dto/booking/BookingResponseDto";

export class BookingMapper {
  /**
   * Maps Domain Entity to the standard Response DTO.
   */
  static toResponse(entity: Booking): BookingResponseDto {
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
      extraCharges: entity.getExtraCharges(),
      timeline: entity.getTimeline(),
      
      chatId: entity.getChatId(),
      
      // ✅ SAFEGUARD: Handle case where snapshots might be null
      snapshots: entity.getSnapshots() || undefined,
      
      meta: entity.getMeta(),
      timestamps: entity.getTimestamps()
    };
  }

  /**
   * Maps raw DB data to Domain Entity.
   */
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
        
        candidateIds: raw.candidateIds || [],
        assignedTechAttempts: attempts,
        assignmentExpiresAt: raw.assignmentExpiresAt ? new Date(raw.assignmentExpiresAt) : undefined,
        
        extraCharges: charges,
        timeline: timeline,
        chatId: raw.chatId,
        
        // ✅ ADDED THIS: Was missing in your uploaded file!
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