import mongoose, { Schema, Document } from "mongoose";

export interface IServiceItemDocument extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  basePrice: number;
  specifications: { title: string; value: string }[];
  imageUrls: string[];
  isActive: boolean;
  isDeleted: boolean;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceItemSchema: Schema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },

    specifications: [
      {
        title: { type: String, required: true },
        value: { type: String, required: true },
        _id: false,
      },
    ],

    imageUrls: [{ type: String }],

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    bookingCount: { type: Number, default: 0, index: -1 },
  },
  { timestamps: true }
);

ServiceItemSchema.index({ categoryId: 1, name: 1 }, { unique: true });

export const ServiceItemModel = mongoose.model<IServiceItemDocument>(
  "ServiceItem",
  ServiceItemSchema
);
