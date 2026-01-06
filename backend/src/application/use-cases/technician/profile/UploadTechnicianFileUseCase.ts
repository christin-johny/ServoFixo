import { IImageService } from "../../../interfaces/IImageService";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { IUseCase } from "../../../interfaces/IUseCase";

// ✅ STRICT Interface for Input
export interface UploadTechnicianFileInput {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  folder: "avatars" | "documents";
}

// ✅ IMPLEMENTS IUseCase
export class UploadTechnicianFileUseCase implements IUseCase<string, [string, UploadTechnicianFileInput]> {
  constructor(
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string, input: UploadTechnicianFileInput): Promise<string> {
    const { fileBuffer, fileName, mimeType, folder } = input;
    
    // Sanitize filename
    const cleanFileName = fileName.replace(/\s+/g, "-");
    const key = `technician/${technicianId}/${folder}/${Date.now()}-${cleanFileName}`;

    this._logger.info(`${LogEvents.TECH_DOC_UPLOAD_INIT}: ${key}`);

    // Upload using service
    const fileUrl = await this._imageService.uploadImage(
      fileBuffer,
      key, 
      mimeType
    );

    this._logger.info(`${LogEvents.TECH_DOC_UPLOAD_SUCCESS}: ${fileUrl}`);
    return fileUrl;
  }
}