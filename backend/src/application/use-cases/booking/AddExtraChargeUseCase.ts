import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { AddExtraChargeDto } from "../../dto/booking/AddExtraChargeDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ExtraCharge } from "../../../../../shared/types/value-objects/BookingTypes";
import { IImageService } from "../../interfaces/IImageService"; 

// Define IFile locally or import it if you have a shared type
export interface IFile {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
}

// ✅ FIX: Update the generic type to accept [Dto, IFile?]
export class AddExtraChargeUseCase implements IUseCase<void, [AddExtraChargeDto, IFile?]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _imageService: IImageService, // ✅ Injected Image Service
    private readonly _logger: ILogger
  ) {}

  // ✅ FIX: Update execute to accept proofFile
  async execute(input: AddExtraChargeDto, proofFile?: IFile): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.getTechnicianId() !== input.technicianId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 1. Handle Image Upload
    let uploadedProofUrl = input.proofUrl || "";
    
    if (proofFile) {
        try {
            uploadedProofUrl = await this._imageService.uploadImage(
                proofFile.buffer,
                proofFile.originalName,
                proofFile.mimeType
            );
            this._logger.info(`Proof image uploaded: ${uploadedProofUrl}`);
        } catch (error) {
            this._logger.error("Failed to upload proof image", `${error}`);
            throw new Error("Failed to upload proof image");
        }
    }

    // 2. Create the Charge Object
    const newCharge: ExtraCharge = {
        id: new Date().getTime().toString(),
        title: input.title,
        amount: Number(input.amount),
        description: input.description || "",
        proofUrl: uploadedProofUrl, // ✅ Use the uploaded URL
        status: "PENDING",
        addedByTechId: input.technicianId,
        addedAt: new Date()
    };

    // 3. Update Domain & Persist
    booking.addExtraCharge(newCharge);
    await this._bookingRepo.addExtraCharge(booking.getId(), newCharge);

    // 4. Notify Customer
    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: "BOOKING_APPROVAL_REQUEST" as any,
        title: "Additional Part Required ⚠️",
        body: `Technician added ${input.title} for ₹${input.amount}. Please approve.`,
        metadata: { 
            bookingId: booking.getId(), 
            chargeId: newCharge.id,
            amount: input.amount.toString(),
            proofUrl: uploadedProofUrl
        },
        clickAction: `/customer/bookings/${booking.getId()}?action=approve_charge`
    });

    this._logger.info(`Extra charge added to booking ${booking.getId()}: ${input.title}`);
  }
}