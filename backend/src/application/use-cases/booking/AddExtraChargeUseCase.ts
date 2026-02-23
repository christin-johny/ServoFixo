import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { AddExtraChargeDto } from "../../dto/booking/AddExtraChargeDto"; 
import { ErrorMessages, NotificationMessages } from "../../constants/ErrorMessages"; 
import { ExtraCharge } from "../../../domain/value-objects/BookingTypes";
import { IImageService } from "../../interfaces/IImageService"; 
import { NotificationType } from "../../../domain/value-objects/NotificationTypes";  

export interface IFile {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
}

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
     
    let uploadedProofUrl = input.proofUrl || "";
    if (proofFile) {
        try {
            uploadedProofUrl = await this._imageService.uploadImage(
                proofFile.buffer, proofFile.originalName, proofFile.mimeType
            );
        } catch  { 
             throw new Error(ErrorMessages.PROOF_UPLOAD_FAILED);
        }
    }
  
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
 
    const savedCharge = await this._bookingRepo.addExtraCharge(booking.getId(), tempCharge);
 
    booking.addExtraCharge(savedCharge); 
  
    const body = `${NotificationMessages.BODY_EXTRA_CHARGE_PART_1}${input.title}${NotificationMessages.BODY_EXTRA_CHARGE_PART_2}${input.amount}${NotificationMessages.BODY_EXTRA_CHARGE_PART_3}`;

    await this._notificationService.send({
        recipientId: booking.getCustomerId(),
        recipientType: "CUSTOMER",
        type: NotificationType.BOOKING_APPROVAL_REQUEST,  
        title: NotificationMessages.TITLE_EXTRA_CHARGE,
        body: body,
        metadata: { 
            bookingId: booking.getId(), 
            chargeId: savedCharge.id,  
            title: input.title,
            amount: input.amount.toString(),
            proofUrl: uploadedProofUrl
        },
        clickAction: `/customer/bookings/${booking.getId()}?action=approve_charge`
    });
 
  }
}