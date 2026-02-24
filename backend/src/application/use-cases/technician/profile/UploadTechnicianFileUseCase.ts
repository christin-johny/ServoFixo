import { UploadTechnicianFileInput } from "../../../dto/technician/TechnicianProfileDto";
import { IImageService } from "../../../interfaces/services/IImageService";
import { IUploadTechnicianFileUseCase } from "../../../interfaces/use-cases/technician/ITechnicianProfileUseCases";
  
 
export class UploadTechnicianFileUseCase implements IUploadTechnicianFileUseCase {
  constructor(
    private readonly _imageService: IImageService 
  ) {}

  async execute(technicianId: string, input: UploadTechnicianFileInput): Promise<string> {
    const { fileBuffer, fileName, mimeType, folder } = input;
     
    const cleanFileName = fileName.replace(/\s+/g, "-");
    const key = `technician/${technicianId}/${folder}/${Date.now()}-${cleanFileName}`;

 
    const fileUrl = await this._imageService.uploadImage(fileBuffer, key, mimeType);

    return fileUrl;
  }
}