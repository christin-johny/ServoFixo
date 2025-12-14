import mongoose, { Document, Model, Schema } from "mongoose";

export interface AdminDocument extends Document {
  email: string;
  password: string;
  roles: string[];
  additionalInfo: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

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
      required: true,
    },
    roles: {
      type: [String],
      default: ["admin"],
    },
    additionalInfo: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const AdminModel: Model<AdminDocument> =
  mongoose.models.Admin || mongoose.model<AdminDocument>("Admin", AdminSchema);
