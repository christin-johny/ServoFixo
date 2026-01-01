export interface ServiceCategoryProps {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceCategory {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly iconUrl: string;
  private readonly isActive: boolean;
  private readonly isDeleted: boolean;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(props: ServiceCategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.iconUrl = props.iconUrl;
    this.isActive = props.isActive;
    this.isDeleted = props.isDeleted;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toProps(): ServiceCategoryProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      iconUrl: this.iconUrl,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getDescription(): string { return this.description; }
  getIconUrl(): string { return this.iconUrl; }
  getIsActive(): boolean { return this.isActive; }
  getIsDeleted(): boolean { return this.isDeleted; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
}