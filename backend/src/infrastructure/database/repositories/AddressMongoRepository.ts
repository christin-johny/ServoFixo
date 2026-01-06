import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { Address } from "../../../domain/entities/Address";
import AddressModel, { AddressDocument } from "../mongoose/models/AddressModel"; 
import { Phone } from "../../../../../shared/types/value-objects/ContactTypes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class AddressMongoRepository implements IAddressRepository {
 
  async create(address: Address): Promise<Address> {
    const props = address.toProps();

    const newDoc = new AddressModel({
      userId: props.userId,
      tag: props.tag,
      isDefault: props.isDefault,
      name: props.name,
      phone: props.phone, 
      houseNumber: props.houseNumber,
      street: props.street,
      landmark: props.landmark,
      city: props.city,
      pincode: props.pincode,
      state: props.state,
      location: props.location,
      zoneId: props.zoneId || null,
      isServiceable: props.isServiceable, 
    });

    const savedDoc = await newDoc.save();
    return this.toDomain(savedDoc);
  }
 
  async findById(id: string): Promise<Address | null> {
    const doc = await AddressModel.findById(id).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }
 
  async findAllByUserId(userId: string): Promise<Address[]> {
    const docs = await AddressModel.find({ userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .exec();
    return docs.map((doc) => this.toDomain(doc));
  }
 
  async update(address: Address): Promise<Address> {
    const props = address.toProps();  

    const updatedDoc = await AddressModel.findByIdAndUpdate(
      props.id, 
      {
        tag: props.tag,
        isDefault: props.isDefault,
        name: props.name,
        phone: props.phone,
        houseNumber: props.houseNumber,
        street: props.street,
        landmark: props.landmark,
        city: props.city,
        pincode: props.pincode,
        state: props.state,
        location: props.location,
        zoneId: props.zoneId,
        isServiceable: props.isServiceable, 
      },
      { new: true } 
    ).exec();

    if (!updatedDoc) throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    return this.toDomain(updatedDoc);
  }
 
  async delete(id: string): Promise<boolean> {
    const result = await AddressModel.findByIdAndDelete(id).exec();
    return !!result; 
  }
 
  async findDefaultByUserId(userId: string): Promise<Address | null> {
    const doc = await AddressModel.findOne({ userId, isDefault: true }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }
 
  async checkServiceability(id: string): Promise<boolean> {
    const doc = await AddressModel.findById(id, 'isServiceable').exec();
    if (!doc) return false;
    return doc.isServiceable;
  }
  
  private toDomain(doc: AddressDocument): Address {
    return new Address({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      tag: doc.tag,
      isDefault: doc.isDefault,
      name: doc.name,
      phone: doc.phone as Phone, 
      houseNumber: doc.houseNumber,
      street: doc.street,
      city: doc.city,
      pincode: doc.pincode,
      state: doc.state, 
      location: { 
        type: "Point", 
        coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]] 
      },
      landmark: doc.landmark,
      zoneId: doc.zoneId ? doc.zoneId.toString() : undefined,
      isServiceable: doc.isServiceable,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date
    });
  }
}