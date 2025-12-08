// backend/src/infrastructure/database/mongoose/models/ZoneModel.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IZoneDocument extends Document {
  name: string;
  description: string;
  location: {
    type: string;
    coordinates: number[][][];
  };
  isActive: boolean;
  additionalInfo: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema: Schema<IZoneDocument> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    isActive: { type: Boolean, default: true },
    additionalInfo: { type: Schema.Types.Mixed, default: {} }, 
  },
  {
    timestamps: true,
  }
);

ZoneSchema.index({ location: '2dsphere' });

export const ZoneModel: Model<IZoneDocument> =
  mongoose.models.Zone || mongoose.model<IZoneDocument>('Zone', ZoneSchema);