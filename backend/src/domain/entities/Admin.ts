import { Email } from '../../../../shared/types/value-objects/ContactTypes';  // Shared Email type

export class Admin {
  private readonly id: string; // PK, e.g., UUID
  private readonly email: Email; // Required
  private readonly password: string; // Hashed later
  private readonly roles: string[]; // e.g., ['super', 'support']
  private readonly additionalInfo: object;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(
    id: string,
    email: Email,
    password: string,
    roles: string[] = ['admin'],
    additionalInfo: object = {},
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.additionalInfo = additionalInfo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters
    getId(): string {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getRoles(): string[] {
    return this.roles;
  }

  getAdditionalInfo(): object {
    return this.additionalInfo;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}