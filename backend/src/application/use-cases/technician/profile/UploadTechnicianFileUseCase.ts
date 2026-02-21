import { IImageService } from "../../../interfaces/IImageService";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";
import { IUseCase } from "../../../interfaces/IUseCase";
 
export interface UploadTechnicianFileInput {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  folder: "avatars" | "documents";
}
 
export class UploadTechnicianFileUseCase implements IUseCase<string, [string, UploadTechnicianFileInput]> {
  constructor(
    private readonly _imageService: IImageService,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string, input: UploadTechnicianFileInput): Promise<string> {
    const { fileBuffer, fileName, mimeType, folder } = input;
     
    const cleanFileName = fileName.replace(/\s+/g, "-");
    const key = `technician/${technicianId}/${folder}/${Date.now()}-${cleanFileName}`;

 
    const fileUrl = await this._imageService.uploadImage(
      fileBuffer,
      key, 
      mimeType
    );

    return fileUrl;
  }
}