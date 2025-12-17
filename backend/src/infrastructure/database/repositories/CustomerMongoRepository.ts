import {
  ICustomerRepository,
  CustomerFilterParams,
  PaginatedResult,
} from "../../../domain/repositories/ICustomerRepository";
import { Customer } from "../../../domain/entities/Customer";
import {
  CustomerModel,
  CustomerDocument,
} from "../mongoose/models/CustomerModel";
import { HydratedDocument } from "mongoose";

export class CustomerMongoRepository implements ICustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const doc = await CustomerModel.findById(id).select("-password").exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const doc = await CustomerModel.findOne({ email: normalizedEmail }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const doc = await CustomerModel.findOne({ phone: phone }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async create(customer: Customer): Promise<Customer> {
    const data = this.toPersistence(customer);
    const doc = await CustomerModel.create(data);
    return this.toEntity(doc);
  }

  async update(customer: Customer): Promise<Customer> {
    const data = this.toPersistence(customer);
    const doc = await CustomerModel.findByIdAndUpdate(customer.getId(), data, {
      new: true,
    }).exec();
    if (!doc) return customer;
    return this.toEntity(doc);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filters: CustomerFilterParams
  ): Promise<PaginatedResult<Customer>> {
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    if (filters.suspended !== undefined) {
      query.suspended = filters.suspended;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [docs, total] = await Promise.all([
      CustomerModel.find(query).skip(skip).limit(limit).exec(),
      CustomerModel.countDocuments(query),
    ]);

    const customers = docs.map((doc) =>
      this.toEntity(doc as HydratedDocument<CustomerDocument>)
    );

    return {
      data: customers,
      total,
      page,
      limit,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await CustomerModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).exec();

    return !!result;
  }

  private toEntity(doc: CustomerDocument): Customer {
    return new Customer(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.password,
      doc.phone,
      doc.avatarUrl,
      doc.defaultZoneId,
      doc.addresses,
      doc.suspended,
      doc.additionalInfo,
      doc.googleId,
      doc.createdAt,
      doc.updatedAt
    );
  }

  private toPersistence(customer: Customer) {
    return {
      name: customer.getName(),
      email: customer.getEmail(),
      password: customer.getPassword(),
      phone: customer.getPhone(),
      googleId: customer.getGoogleId(),
      suspended: customer.isSuspended(),
    };
  }
}
