import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { IImageService } from "../../application/interfaces/IImageService";

export class S3ImageService implements IImageService {
  private _s3Client: S3Client;
  private _bucketName: string;
  private _region: string;

  constructor() {
    this._region = process.env.AWS_REGION || "";
    this._bucketName = process.env.AWS_BUCKET_NAME || "";

    this._s3Client = new S3Client({
      region: this._region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = "general"  
  ): Promise<string> { 
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const key = `${folder}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this._bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await this._s3Client.send(command);
 
    return key; 
  }

  async deleteImage(fileKey: string): Promise<void> {
    try { 
      const key = fileKey.includes(".amazonaws.com/") 
        ? fileKey.split(".amazonaws.com/")[1] 
        : fileKey;

      const command = new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      });

      await this._s3Client.send(command);
    } catch (error) {
      console.error("Error deleting image from S3:", error);
    }
  }
}