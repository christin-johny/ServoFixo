export interface IImageService {

  uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;

  deleteImage(imageUrl: string): Promise<void>;
}