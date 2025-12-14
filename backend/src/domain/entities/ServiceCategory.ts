export class ServiceCategory {
  constructor(
    private readonly _id: string,
    private name: string,
    private description: string,
    private iconUrl: string,
    private isActive: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  getId(): string {
    return this._id;
  }
  getName(): string {
    return this.name;
  }
  getDescription(): string {
    return this.description;
  }
  getIconUrl(): string {
    return this.iconUrl;
  }
  getIsActive(): boolean {
    return this.isActive;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateDetails(name: string, description: string, isActive: boolean): void {
    if (name.length < 3)
      throw new Error("Category name must be at least 3 characters.");
    this.name = name;
    this.description = description;
    this.isActive = isActive;
    this.updatedAt = new Date();
  }

  updateIcon(newUrl: string): void {
    if (!newUrl.startsWith("http")) throw new Error("Invalid Icon URL.");
    this.iconUrl = newUrl;
    this.updatedAt = new Date();
  }
}
