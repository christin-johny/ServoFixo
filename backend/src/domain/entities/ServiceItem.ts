export interface ServiceSpecification {
  title: string;
  value: string;
}

export interface ServiceItemProps {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  specifications: ServiceSpecification[];
  imageUrls: string[];
  isActive: boolean;
  rating: number;
  bookingCount:number 
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceItem {
  constructor(private readonly props: ServiceItemProps) {}

  getId(): string { return this.props.id; }
  getCategoryId(): string { return this.props.categoryId; }
  getName(): string { return this.props.name; }
  getDescription(): string { return this.props.description; }
  getBasePrice(): number { return this.props.basePrice; }
  getSpecifications(): ServiceSpecification[] { return this.props.specifications; }
  getImageUrls(): string[] { return this.props.imageUrls; }
  getIsActive(): boolean { return this.props.isActive; }
  getRating(): number { return this.props.rating; }
  getReviewCount(): number { return this.props.reviewCount; }
  getCreatedAt(): Date { return this.props.createdAt; }
  getUpdatedAt(): Date { return this.props.updatedAt; }
  getBookingCount(): number {return this.props.bookingCount;}

  toProps(): ServiceItemProps {
    return { ...this.props };
  }
}