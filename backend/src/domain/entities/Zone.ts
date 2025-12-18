export class Zone {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly boundaries: { lat: number; lng: number }[];
  private readonly isActive: boolean;
  private readonly additionalInfo: object;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private isDeleted: boolean; // 🟢 Added

  constructor(
    id: string,
    name: string,
    description: string,
    boundaries: { lat: number; lng: number }[],
    isActive: boolean = true,
    additionalInfo: object = {},
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    isDeleted: boolean = false // 🟢 Added
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.boundaries = boundaries;
    this.isActive = isActive;
    this.additionalInfo = additionalInfo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isDeleted = isDeleted; 
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getDescription(): string { return this.description; }
  getBoundaries(): { lat: number; lng: number }[] { return this.boundaries; }
  getIsActive(): boolean { return this.isActive; }
  getAdditionalInfo(): object { return this.additionalInfo; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  getIsDeleted(): boolean { return this.isDeleted; } 
}