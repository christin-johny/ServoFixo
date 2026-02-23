import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3UrlHelper {
  private static readonly BASE_URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  
  private static _s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
 
  static getFullUrl(key: string | undefined | null): string {
    if (!key) return ""; 
    if (key.startsWith("http")) return key;
    return `${this.BASE_URL}/${key}`;
  }
 
  static async getPrivateUrl(key: string | undefined | null): Promise<string> {
    if (!key) return "";
    if (key.startsWith("http")) return key;
 
    const expiresIn = parseInt(process.env.S3_SIGNED_URL_EXPIRES_IN || "3600", 10);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(this._s3Client, command, { expiresIn });
  }
}