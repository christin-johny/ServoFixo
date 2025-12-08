import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceCategoryDocument extends Document {
  name: string;
  description: string;
  iconUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    iconUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for fast search
ServiceCategorySchema.index({ name: 'text' });

export const ServiceCategoryModel = mongoose.model<IServiceCategoryDocument>(
  'ServiceCategory',
  ServiceCategorySchema
);