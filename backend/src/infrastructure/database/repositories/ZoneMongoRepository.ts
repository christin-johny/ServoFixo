import {
  IZoneRepository,
  ZoneQueryParams,
  PaginatedZones,
} from "../../../domain/repositories/IZoneRepository";
import { Zone } from "../../../domain/entities/Zone";
import { ZoneModel, IZoneDocument } from "../mongoose/models/ZoneModel";
import { ErrorMessages } from "../../../application/constants/ErrorMessages";

export class ZoneMongoRepository implements IZoneRepository {
  async create(zone: Zone): Promise<Zone> {
    try {
      const persistenceData = this.toPersistence(zone);
      const doc = await ZoneModel.create(persistenceData);

      return this.toDomain(doc);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        ((err as { code?: number }).code === 16755 ||
          err.message.includes("Loop is not valid"))
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
      coordinates: [lng, lat], 
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
    const persistenceData = this.toPersistence(zone);

    const { _id, ...updateData } = persistenceData as any;

    try {
      const doc = await ZoneModel.findByIdAndUpdate(zone.getId(), updateData, {
        new: true,
      }).exec();

      if (!doc) throw new Error(ErrorMessages.ZONE_NOT_FOUND);
      return this.toDomain(doc);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "";

      const errorCode =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code?: unknown }).code === "number"
          ? (err as { code: number }).code
          : undefined;

      if (errorCode === 16755 || errorMessage.includes("Loop is not valid")) {
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
      zones: docs.map((doc) => this.toDomain(doc)), 
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toDomain(doc: IZoneDocument): Zone {
    const points = doc.location.coordinates[0].map((p: number[]) => ({
      lng: p[0],
      lat: p[1],
    }));

    return new Zone({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      boundaries: points,
      isActive: doc.isActive,
      additionalInfo: doc.additionalInfo,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted,
    });
  }

  private toPersistence(zone: Zone) {
    const props = zone.toProps(); 
    const points = props.boundaries;

    let ring = points.map((p) => [p.lng, p.lat]);

    ring = ring.filter((point, index) => {
      if (index === 0) return true;
      const prev = ring[index - 1];
      return point[0] !== prev[0] || point[1] !== prev[1];
    });

    if (ring.length < 3) {
      throw new Error(ErrorMessages.INVALID_ZONE);
    }

    const first = ring[0];
    let closingIndex = -1;

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
        coordinates: [ring], 
      },
      isDeleted: props.isDeleted,
    };
  }
}
