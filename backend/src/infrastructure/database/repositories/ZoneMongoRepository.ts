import { IZoneRepository } from '../../../domain/repositories/IZoneRepository';
import { Zone } from '../../../domain/entities/Zone';
import { ZoneModel, IZoneDocument } from '../mongoose/models/ZoneModel';

export class ZoneMongoRepository implements IZoneRepository {
  
  async create(zone: Zone): Promise<Zone> {
    try {
      const persistenceData = this.toPersistence(zone);
      const doc = await ZoneModel.create(persistenceData);
      return this.toEntity(doc);
    } catch (err: any) {
      // ✅ Catch GeoJSON Validation Errors (e.g., Self-intersecting polygons)
      if (err.code === 16755 || (err.message && err.message.includes("Loop is not valid"))) {
        throw new Error('Invalid Zone Shape: The boundaries cannot cross each other. Please draw a simple loop.');
      }
      throw err;
    }
  }

  async findAll(): Promise<Zone[]> {
    const docs = await ZoneModel.find().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findById(id: string): Promise<Zone | null> {
    const doc = await ZoneModel.findById(id).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByName(name: string): Promise<Zone | null> {
    // Escape special characters to prevent regex errors
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a case-insensitive regex for exact match (^...$)
    const doc = await ZoneModel.findOne({ 
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') } 
    }).exec();

    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(zone: Zone): Promise<Zone> {
    const persistenceData = this.toPersistence(zone);
    const { _id, ...updateData } = persistenceData as any;

    try {
      const doc = await ZoneModel.findByIdAndUpdate(
        zone.getId(),
        updateData,
        { new: true }
      ).exec();

      if (!doc) throw new Error('Zone not found for update');
      return this.toEntity(doc);
    } catch (err: any) {
      // ✅ Catch GeoJSON Validation Errors during update
      if (err.code === 16755 || (err.message && err.message.includes("Loop is not valid"))) {
        throw new Error('Invalid Zone Shape: The boundaries cannot cross each other. Please draw a simple loop.');
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await ZoneModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // 🔄 Mapper: Mongo Doc -> Domain Entity
  private toEntity(doc: IZoneDocument): Zone {
    const points = doc.location.coordinates[0].map((p: number[]) => ({
      lng: p[0],
      lat: p[1]
    }));

    return new Zone(
      doc._id.toString(),
      doc.name,
      doc.description,
      points,
      doc.isActive,
      doc.additionalInfo,
      doc.createdAt,
      doc.updatedAt
    );
  }

  // 🔄 Mapper: Domain Entity -> Mongo Doc Structure
  // ✅ FIX: Added robust cleaning logic to prevent "Duplicate vertices" errors
  private toPersistence(zone: Zone) {
    const points = zone.getBoundaries();
    
    // 1. Convert to [lng, lat]
    let ring = points.map(p => [p.lng, p.lat]);

    // 2. Remove adjacent duplicates (e.g. clicking same spot twice)
    ring = ring.filter((point, index) => {
      if (index === 0) return true;
      const prev = ring[index - 1];
      // Keep point only if it's different from the previous one
      return point[0] !== prev[0] || point[1] !== prev[1];
    });

    if (ring.length < 3) {
       // A polygon needs at least 3 points. Return as is, let Mongoose/Controller validation handle the error if needed.
    } else {
      const first = ring[0];
      
      // 3. Find if the polygon closes prematurely
      // If the start point appears again in the middle, we cut off the "tail"
      let closingIndex = -1;
      // Start searching from index 2 to allow at least a minimal triangle shape
      for (let i = 2; i < ring.length; i++) {
        if (ring[i][0] === first[0] && ring[i][1] === first[1]) {
          closingIndex = i;
          break;
        }
      }

      if (closingIndex !== -1) {
        // We found a loop! Truncate everything after this closing point.
        // This removes the "tail" that causes the invalid loop error.
        ring = ring.slice(0, closingIndex + 1);
      } else {
        // It's not closed yet, so we close it manually
        ring.push(first);
      }
    }

    return {
      name: zone.getName(),
      description: zone.getDescription(),
      isActive: zone.getIsActive(),
      additionalInfo: zone.getAdditionalInfo(),
      location: {
        type: 'Polygon',
        coordinates: [ring]
      }
    };
  }
}