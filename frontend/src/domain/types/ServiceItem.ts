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
  specifications: ServiceSpecification[];  
  imageUrls: string[];  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rating?: number;
reviewCount?: number;
}