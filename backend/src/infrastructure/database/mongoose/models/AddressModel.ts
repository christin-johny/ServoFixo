import mongoose, { Schema, Document } from "mongoose";

export interface AddressDocument extends Document {
  userId: mongoose.Types.ObjectId; 

  tag: string; 
  isDefault: boolean; 

  name: string;
  phone: string;

  houseNumber: string;
  street: string;
  landmark?: string; 
  city: string;
  pincode: string;
  state: string;

  location: {
    type: "Point";
    coordinates: [number, number]; 
  };

  zoneId: mongoose.Types.ObjectId | null; 
  isServiceable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer", 
      required: true,
    },

    tag: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    isDefault: { type: Boolean, default: false },

    name: { type: String, required: true }, 
    phone: { type: String, required: true }, 

    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String }, 
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },

    zoneId: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
      default: null,
    },
    isServiceable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

AddressSchema.index({ location: "2dsphere" });

export default mongoose.model<AddressDocument>("Address", AddressSchema);
