export interface ZoneProps {
  id: string;
  name: string;
  description: string;
  boundaries: { lat: number; lng: number }[];
  isActive: boolean;
  additionalInfo?: object;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

export class Zone {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly boundaries: { lat: number; lng: number }[];
  private readonly isActive: boolean;
  private readonly additionalInfo: object;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private readonly isDeleted: boolean;

  constructor(props: ZoneProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.boundaries = props.boundaries;
    this.isActive = props.isActive;
    this.additionalInfo = props.additionalInfo || {};
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.isDeleted = props.isDeleted ?? false;
  }

  toProps(): ZoneProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      boundaries: this.boundaries,
      isActive: this.isActive,
      additionalInfo: this.additionalInfo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDeleted: this.isDeleted,
    };
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