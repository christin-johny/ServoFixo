import mongoose, { Schema, Document } from "mongoose";

export interface AddressDocument extends Document {
  userId: mongoose.Types.ObjectId; // Link to Customer

  tag: string; // "Home", "Work", "Parents", "Other"
  isDefault: boolean; // Used to pre-select this address at checkout

  // 👤 Contact at this location (e.g., if booking for parents)
  name: string;
  phone: string;

  // 📝 Human Readable Address (From Form/Nominatim)
  houseNumber: string;
  street: string; // "100ft Road" or "Near Apollo Hospital"
  landmark?: string; // Optional but helpful for techs
  city: string;
  pincode: string;
  state: string;

  // 🌍 GEOSPATIAL DATA (Crucial for Zone Calculation)
  location: {
    type: "Point";
    coordinates: [number, number]; // [Longitude, Latitude]
  };

  // 🛡️ Zone Logic (Auto-filled by Backend)
  zoneId: mongoose.Types.ObjectId | null; // The Zone this address belongs to
  isServiceable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose Schema (For Database Validation)
const AddressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer", // Make sure your User model is named "Customer" or "User"
      required: true,
    },

    tag: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    isDefault: { type: Boolean, default: false },

    name: { type: String, required: true }, // Required: Receiver's name
    phone: { type: String, required: true }, // Required: Receiver's phone

    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String }, // Optional
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },

    // 🟢 The GeoJSON Field
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // Array of numbers
        required: true,
      },
    },

    // 🟢 Zone Links
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

// 🚀 CRITICAL INDEX: This enables "Find zones near me" queries to work fast
AddressSchema.index({ location: "2dsphere" });

export default mongoose.model<AddressDocument>("Address", AddressSchema);
