import {
  IZoneRepository,
  ZoneQueryParams,
  PaginatedZones,
} from "../../../domain/repositories/IZoneRepository";
import { Zone } from "../../../domain/entities/Zone";
import { ZoneModel, IZoneDocument } from "../mongoose/models/ZoneModel";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class ZoneMongoRepository implements IZoneRepository {
  
  async create(zone: Zone): Promise<Zone> {
    try {
      // 1. Convert Entity -> DB Format
      const persistenceData = this.toPersistence(zone);
      const doc = await ZoneModel.create(persistenceData);
      
      // 2. Convert DB Format -> Entity
      return this.toDomain(doc);
    } catch (err: any) {
      if (
        err.code === 16755 ||
        (err.message && err.message.includes("Loop is not valid"))
      ) {
        throw new Error(ErrorMessages.INVALID_ZONE);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Zone | null> {
    const doc = await ZoneModel.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByName(name: string): Promise<Zone | null> {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const doc = await ZoneModel.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, "i") },
      isDeleted: { $ne: true },
    }).exec();

    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findZoneByCoordinates(lat: number, lng: number): Promise<Zone | null> {
    const point = {
      type: "Point",
      coordinates: [lng, lat], // GeoJSON is [lng, lat]
    };

    const doc = await ZoneModel.findOne({
      location: {
        $geoIntersects: {
          $geometry: point,
        },
      },
      isActive: true,
      isDeleted: { $ne: true },
    }).exec();

    if (!doc) return null;
    return this.toDomain(doc);
  }

  async update(zone: Zone): Promise<Zone> {
    // Extract data cleanly using toProps()
    const persistenceData = this.toPersistence(zone);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = persistenceData as any;

    try {
      const doc = await ZoneModel.findByIdAndUpdate(zone.getId(), updateData, {
        new: true,
      }).exec();

      if (!doc) throw new Error(ErrorMessages.ZONE_NOT_FOUND);
      return this.toDomain(doc);
    } catch (err: any) {
      if (
        err.code === 16755 ||
        (err.message && err.message.includes("Loop is not valid"))
      ) {
        throw new Error(ErrorMessages.INVALID_ZONE);
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await ZoneModel.findByIdAndUpdate(id, {
      isDeleted: true,
    }).exec();
    return !!result;
  }

  async findAll(params: ZoneQueryParams): Promise<PaginatedZones> {
    const { page, limit, search, isActive } = params;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: { $ne: true } };

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [docs, total] = await Promise.all([
      ZoneModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ZoneModel.countDocuments(query).exec(),
    ]);

    return {
      zones: docs.map((doc) => this.toDomain(doc)), // <--- Mapped to 'zones'
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // --- MAPPERS ---

  // DB Document -> Domain Entity
  private toDomain(doc: IZoneDocument): Zone {
    // GeoJSON Polygon is [[[lng, lat], [lng, lat]]]
    // We Map back to { lat, lng } for Domain
    const points = doc.location.coordinates[0].map((p: number[]) => ({
      lng: p[0],
      lat: p[1],
    }));

    // Uses the new strict constructor
    return new Zone({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      boundaries: points,
      isActive: doc.isActive,
      additionalInfo: doc.additionalInfo,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted
    });
  }

  // Domain Entity -> DB Document
  private toPersistence(zone: Zone) {
    const props = zone.toProps(); // Access data via props
    const points = props.boundaries;
    
    // Convert { lat, lng } -> [lng, lat] for GeoJSON
    let ring = points.map((p) => [p.lng, p.lat]);

    // 1. Remove adjacent duplicates
    ring = ring.filter((point, index) => {
      if (index === 0) return true;
      const prev = ring[index - 1];
      return point[0] !== prev[0] || point[1] !== prev[1];
    });

    if (ring.length < 3) {
      throw new Error(ErrorMessages.INVALID_ZONE);
    } 
    
    // 2. Ensure Ring is Closed (First point == Last point)
    const first = ring[0];
    let closingIndex = -1;
    
    // Check if the loop closes naturally somewhere in the middle (invalid loop)
    for (let i = 2; i < ring.length; i++) {
      if (ring[i][0] === first[0] && ring[i][1] === first[1]) {
        closingIndex = i;
        break;
      }
    }

    if (closingIndex !== -1) {
      ring = ring.slice(0, closingIndex + 1);
    } else {
      const last = ring[ring.length - 1];
      if (last[0] !== first[0] || last[1] !== first[1]) {
        ring.push(first);
      }
    }

    return {
      name: props.name,
      description: props.description,
      isActive: props.isActive,
      additionalInfo: props.additionalInfo,
      location: {
        type: "Polygon",
        coordinates: [ring], // Mongo expects Array of Rings
      },
      isDeleted: props.isDeleted, 
    };
  }
}