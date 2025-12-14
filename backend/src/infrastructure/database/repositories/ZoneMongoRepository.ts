import {
  IZoneRepository,
  ZoneQueryParams,
  PaginatedZones,
} from "../../../domain/repositories/IZoneRepository";
import { Zone } from "../../../domain/entities/Zone";
import { ZoneModel, IZoneDocument } from "../mongoose/models/ZoneModel";

export class ZoneMongoRepository implements IZoneRepository {
  async create(zone: Zone): Promise<Zone> {
    try {
      const persistenceData = this.toPersistence(zone);
      const doc = await ZoneModel.create(persistenceData);
      return this.toEntity(doc);
    } catch (err: any) {
      if (
        err.code === 16755 ||
        (err.message && err.message.includes("Loop is not valid"))
      ) {
        throw new Error(
          "Invalid Zone Shape: The boundaries cannot cross each other. Please draw a simple loop."
        );
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
    return this.toEntity(doc);
  }

  async findByName(name: string): Promise<Zone | null> {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const doc = await ZoneModel.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, "i") },
      isDeleted: { $ne: true },
    }).exec();

    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(zone: Zone): Promise<Zone> {
    const persistenceData = this.toPersistence(zone);
    const { _id, ...updateData } = persistenceData as any;

    try {
      const doc = await ZoneModel.findByIdAndUpdate(zone.getId(), updateData, {
        new: true,
      }).exec();

      if (!doc) throw new Error("Zone not found for update");
      return this.toEntity(doc);
    } catch (err: any) {
      if (
        err.code === 16755 ||
        (err.message && err.message.includes("Loop is not valid"))
      ) {
        throw new Error(
          "Invalid Zone Shape: The boundaries cannot cross each other. Please draw a simple loop."
        );
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

  private toEntity(doc: IZoneDocument): Zone {
    const points = doc.location.coordinates[0].map((p: number[]) => ({
      lng: p[0],
      lat: p[1],
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

  private toPersistence(zone: Zone) {
    const points = zone.getBoundaries();
    let ring = points.map((p) => [p.lng, p.lat]);

    ring = ring.filter((point, index) => {
      if (index === 0) return true;
      const prev = ring[index - 1];
      return point[0] !== prev[0] || point[1] !== prev[1];
    });

    if (ring.length < 3) {
    } else {
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
        ring.push(first);
      }
    }

    return {
      name: zone.getName(),
      description: zone.getDescription(),
      isActive: zone.getIsActive(),
      additionalInfo: zone.getAdditionalInfo(),
      location: {
        type: "Polygon",
        coordinates: [ring],
      },
    };
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
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
