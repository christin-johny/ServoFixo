import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService";  
import { AddExtraChargeDto } from "../../dto/booking/AddExtraChargeDto"; 
import { ErrorMessages, NotificationMessages } from "../../constants/ErrorMessages"; 
import { ExtraCharge } from "../../../domain/value-objects/BookingTypes";
import { IImageService } from "../../interfaces/services/IImageService"; 
import { NotificationType } from "../../../domain/value-objects/NotificationTypes";  
import { IFile } from "../../dto/file/FileDto";
import { IAddExtraChargeUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";



export class AddExtraChargeUseCase implements IAddExtraChargeUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _imageService: IImageService
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