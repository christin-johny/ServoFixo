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
  additionalInfo: Record<string, any>;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted:boolean;
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
    phone: { 
      type: String,
      unique: true,  
      sparse: true    
    },
    password: {
      type: String,
      required: false,
      default: '', 
    },
    avatarUrl: { type: String },
    defaultZoneId: { type: String },
    addresses: { type: [], default: [] },
    suspended: { type: Boolean, default: false },
    additionalInfo: { type: Schema.Types.Mixed, default: {} },
    googleId: { type: String, unique: true, sparse: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const CustomerModel: Model<CustomerDocument> =
  mongoose.models.Customer ||
  mongoose.model<CustomerDocument>('Customer', CustomerSchema);