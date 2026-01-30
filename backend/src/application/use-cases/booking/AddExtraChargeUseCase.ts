import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { AddExtraChargeDto } from "../../dto/booking/AddExtraChargeDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ExtraCharge } from "../../../../../shared/types/value-objects/BookingTypes";
import { IImageService } from "../../interfaces/IImageService"; 
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes"; // ✅ Import Enum

export interface IFile {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
}

// ... imports (NO mongoose import needed!)

export class AddExtraChargeUseCase implements IUseCase<void, [AddExtraChargeDto, IFile?]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: AddExtraChargeDto, proofFile?: IFile): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.getTechnicianId() !== input.technicianId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    } 
    
    // 1. Handle Image Upload (Same as before)
    let uploadedProofUrl = input.proofUrl || "";
    if (proofFile) {
        try {
            uploadedProofUrl = await this._imageService.uploadImage(
                proofFile.buffer, proofFile.originalName, proofFile.mimeType
            );
        } catch (error) {
             throw new Error("Failed to upload proof image");
        }
    }

    // 2. Create Temporary Charge Object
    // The ID here is temporary. MongoDB will replace it.
    const tempCharge: ExtraCharge = {
        id: "TEMP_ID", 
        title: input.title,
        amount: Number(input.amount),
        description: input.description || "",
        proofUrl: uploadedProofUrl,
        status: "PENDING",
        addedByTechId: input.technicianId,
        addedAt: new Date()
    }; 

    // 3. Update Domain & Persist
    // ✅ FIX: Await the REAL saved object from the Repo
    const savedCharge = await this._bookingRepo.addExtraCharge(booking.getId(), tempCharge);

    // Update in-memory domain with the REAL ID
    booking.addExtraCharge(savedCharge); 

    // 4. Notify Customer with the REAL ID
    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: NotificationType.BOOKING_APPROVAL_REQUEST, 
        title: "Additional Part Required ⚠️",
        body: `Technician added ${input.title} for ₹${input.amount}. Please approve.`,
        metadata: { 
            bookingId: booking.getId(), 
            chargeId: savedCharge.id, // <--- Socket now sends the exact ID that exists in DB
            title: input.title,
            amount: input.amount.toString(),
            proofUrl: uploadedProofUrl
        },
        clickAction: `/customer/bookings/${booking.getId()}?action=approve_charge`
    });

    this._logger.info(`Extra charge added to booking ${booking.getId()}: ${input.title}`);
  }
}