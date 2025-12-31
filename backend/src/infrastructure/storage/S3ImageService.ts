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
    mimeType: string
  ): Promise<string> {
    const uniqueFileName = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this._bucketName,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await this._s3Client.send(command);

    return `https://${this._bucketName}.s3.${this._region}.amazonaws.com/${uniqueFileName}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split(".amazonaws.com/");
      if (urlParts.length < 2) return;

      const key = urlParts[1];

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
