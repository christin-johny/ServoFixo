import mongoose, { Document, Model, Schema } from 'mongoose';

export interface CustomerDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  avatarUrl?: string;
  defaultZoneId?: string;
  addresses: any[];
  suspended: boolean;
  suspendReason?: string;
  additionalInfo: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema<CustomerDocument> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String },
    password: {
      type: String,
      required: true,
      default: '',  // for OTP-only login you can keep empty for now
    },
    avatarUrl: { type: String },
    defaultZoneId: { type: String },
    addresses: { type: [], default: [] },
    suspended: { type: Boolean, default: false },
    suspendReason: { type: String },
    additionalInfo: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

export const CustomerModel: Model<CustomerDocument> =
  mongoose.models.Customer ||
  mongoose.model<CustomerDocument>('Customer', CustomerSchema);
