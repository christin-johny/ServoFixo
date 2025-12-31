import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import { Admin } from "../../../domain/entities/Admin";
import { AdminModel, AdminDocument } from "../mongoose/models/AdminModel";

export class AdminMongoRepository implements IAdminRepository {
  async findById(id: string): Promise<Admin | null> {
    const doc = await AdminModel.findById(id).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const doc = await AdminModel.findOne({ email: normalizedEmail }).exec();
    if (!doc) return null;

    return this.toEntity(doc);
  }

  async create(admin: Admin): Promise<Admin> {
    const data = this.toPersistence(admin);

    const doc = await AdminModel.create(data);

    return this.toEntity(doc);
  }

  private toEntity(doc: AdminDocument): Admin {
    return new Admin(
      doc._id.toString(),
      doc.email,
      doc.password,
      doc.roles,
      doc.additionalInfo || {},
      doc.createdAt,
      doc.updatedAt
    );
  }

  private toPersistence(admin: Admin): {
    email: string;
    password: string;
    roles: string[];
    additionalInfo: Record<string, any>;
  } {
    return {
      email: admin.getEmail(),
      password: admin.getPassword(),
      roles: admin.getRoles(),
      additionalInfo: (admin.getAdditionalInfo() || {}) as Record<string, any>,
    };
  }
}
