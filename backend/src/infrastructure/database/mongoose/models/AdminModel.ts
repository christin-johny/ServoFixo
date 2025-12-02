// backend/src/infrastructure/database/mongoose/models/AdminModel.ts

import mongoose, { Document, Model, Schema } from 'mongoose';

// 1️⃣ AdminDocument – shape of document in MongoDB (Mongoose level)
export interface AdminDocument extends Document {
  email: string;
  password: string;
  roles: string[];
  additionalInfo: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 2️⃣ Admin Schema – defines how admin is stored in MongoDB
const AdminSchema: Schema<AdminDocument> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // hashed password
    },
    roles: {
      type: [String],
      default: ['admin'],
    },
    additionalInfo: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // auto adds createdAt, updatedAt
  }
);

// 3️⃣ AdminModel – Mongoose model for the "admins" collection
export const AdminModel: Model<AdminDocument> =
  mongoose.models.Admin || mongoose.model<AdminDocument>('Admin', AdminSchema);
