export class S3UrlHelper {
  private static readonly BASE_URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

  static getFullUrl(key: string | undefined | null): string {
    if (!key) return ""; 
    if (key.startsWith("http")) return key;
    return `${this.BASE_URL}/${key}`;
  }
}