// Helper type for the additional details
export interface ServiceSpecification {
  title: string; // e.g., "Duration", "Warranty"
  value: string; // e.g., "45 Mins", "30 Days"
}

export class ServiceItem {
  constructor(
    private readonly _id: string,
    private categoryId: string,
    private name: string,
    private description: string,
    private basePrice: number,
    private specifications: ServiceSpecification[], // ✅ Flexible Additional Info
    private imageUrls: string[], // ✅ Multiple Images
    private isActive: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  // Getters
  getId(): string { return this._id; }
  getCategoryId(): string { return this.categoryId; }
  getName(): string { return this.name; }
  getDescription(): string { return this.description; }
  getBasePrice(): number { return this.basePrice; }
  getSpecifications(): ServiceSpecification[] { return this.specifications; }
  getImageUrls(): string[] { return this.imageUrls; }
  getIsActive(): boolean { return this.isActive; }

  // Business Logic
  updateDetails(
    name: string, 
    description: string, 
    basePrice: number, 
    specifications: ServiceSpecification[],
    isActive: boolean
  ): void {
    if (basePrice < 0) throw new Error("Price cannot be negative.");
    if (name.length < 3) throw new Error("Name must be at least 3 characters.");
    
    this.name = name;
    this.description = description;
    this.basePrice = basePrice;
    this.specifications = specifications;
    this.isActive = isActive;
    this.updatedAt = new Date();
  }

  // Manage Images
  addImages(newUrls: string[]): void {
    this.imageUrls = [...this.imageUrls, ...newUrls];
    this.updatedAt = new Date();
  }

  removeImage(urlToRemove: string): void {
    this.imageUrls = this.imageUrls.filter(url => url !== urlToRemove);
    this.updatedAt = new Date();
  }
}