// backend/src/infrastructure/database/repositories/CustomerMongoRepository.ts

import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { Customer } from '../../../domain/entities/Customer';
import { CustomerModel, CustomerDocument } from '../mongoose/models/CustomerModel';

export class CustomerMongoRepository implements ICustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const doc = await CustomerModel.findById(id).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const doc = await CustomerModel.findOne({ email: normalizedEmail }).exec();
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

    const doc = await CustomerModel.findByIdAndUpdate(
      customer.getId(),
      data,
      { new: true }
    ).exec();

    if (!doc) return customer;

    return this.toEntity(doc);
  }

  // 🔽 Helpers

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
      doc.suspendReason,
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
    };
  }
}
