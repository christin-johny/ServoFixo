import { IAddressRepository } from "../../../domain/repositories/IAddressRepository";
import { Address } from "../../../domain/entities/Address";
import AddressModel, { AddressDocument } from "../mongoose/models/AddressModel"; 
import { Phone } from "../../../../../shared/types/value-objects/ContactTypes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class AddressMongoRepository implements IAddressRepository {

  // 1. Create a new Address
  async create(address: Address): Promise<Address> {
    const newDoc = new AddressModel({
      userId: address.getUserId(),
      tag: address.getTag(),
      isDefault: address.getIsDefault(),
      name: address.getName(),
      
      phone: address.getPhone(), 

      houseNumber: address.getHouseNumber(),
      street: address.getStreet(),
      landmark: address.getLandmark(),
      city: address.getCity(),
      pincode: address.getPincode(),
      state: address.getState(),

      location: address.getLocation(),
      zoneId: address.getZoneId() || null,
      isServiceable: address.getIsServiceable()
    });

    const savedDoc = await newDoc.save();
    return this.toEntity(savedDoc);
  }

  // 2. Find by ID
  async findById(id: string): Promise<Address | null> {
    const doc = await AddressModel.findById(id).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  // 3. Find All Addresses for a specific User
  async findAllByUserId(userId: string): Promise<Address[]> {
    const docs = await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  // 4. Update an Existing Address
  async update(address: Address): Promise<Address> {
    const updatedDoc = await AddressModel.findByIdAndUpdate(
      address.getId(),
      {
        tag: address.getTag(),
        isDefault: address.getIsDefault(),
        name: address.getName(),
        
        // ✅ CORRECT: Pass the string directly
        phone: address.getPhone(),
        
        houseNumber: address.getHouseNumber(),
        street: address.getStreet(),
        landmark: address.getLandmark(),
        city: address.getCity(),
        pincode: address.getPincode(),
        state: address.getState(),
        
        location: address.getLocation(),
        zoneId: address.getZoneId(),
        isServiceable: address.getIsServiceable(),
      },
      { new: true } 
    ).exec();

    if (!updatedDoc) throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
    return this.toEntity(updatedDoc);
  }

  // 5. Delete an Address
  async delete(id: string): Promise<boolean> {
    const result = await AddressModel.findByIdAndDelete(id).exec();
    return !!result; 
  }

  // 6. Find the Default Address 
  async findDefaultByUserId(userId: string): Promise<Address | null> {
    const doc = await AddressModel.findOne({ userId, isDefault: true }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  // 7. Quick Serviceability Check
  async checkServiceability(id: string): Promise<boolean> {
    const doc = await AddressModel.findById(id, 'isServiceable').exec();
    if (!doc) return false;
    return doc.isServiceable;
  }

  // --- PRIVATE HELPER ---
  private toEntity(doc: AddressDocument): Address {
    return new Address(
      doc._id.toString(),
      doc.userId.toString(),
      doc.tag,
      doc.isDefault,
      doc.name,
      doc.phone as Phone, 
      doc.houseNumber,
      doc.street,
      doc.city,
      doc.pincode,
      doc.state,
      { 
        type: "Point", 
        coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]] 
      },
      doc.landmark,
      doc.zoneId ? doc.zoneId.toString() : undefined,
      doc.isServiceable,
      doc.createdAt as Date,
      doc.updatedAt as Date
    );
  }
}