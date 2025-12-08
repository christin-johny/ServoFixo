import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IImageService } from '../../application/services/IImageService';

export class S3ImageService implements IImageService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || '';
    this.bucketName = process.env.AWS_BUCKET_NAME || '';

    // Initialize the AWS Client with your credentials
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const uniqueFileName = `${Date.now()}-${fileName}`; // Prevent duplicate names

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      // We don't need 'ACL: public-read' because we set a Bucket Policy instead
    });

    await this.s3Client.send(command);

    // Return the public URL
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${uniqueFileName}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract the key (filename) from the full URL
      // URL format: https://BUCKET.s3.REGION.amazonaws.com/FILENAME
      const urlParts = imageUrl.split('.amazonaws.com/');
      if (urlParts.length < 2) return; // Invalid URL, nothing to delete

      const key = urlParts[1];

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      // We don't throw error here to prevent blocking the main deletion flow
    }
  }
}