export interface ServiceSpecification {
  title: string;
  value: string;
}

export interface ServiceItem {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  specifications: ServiceSpecification[]; // Array of details
  imageUrls: string[]; // Array of S3 links
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}