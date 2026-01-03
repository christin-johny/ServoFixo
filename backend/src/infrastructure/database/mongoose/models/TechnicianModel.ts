import mongoose, { Schema, Document, Model } from "mongoose";
import { VerificationStatus } from "../../../../../../shared/types/value-objects/TechnicianTypes";

export interface TechnicianDocument extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  
  // ✅ Added for Step 1
  experienceSummary?: string; 
  // ✅ Added for Resume Logic (Step 1-7)
  onboardingStep: number; 

  // Professional
  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  // ✅ Updated for Step 5 (KYC)
  documents: Array<{
    type: string; // e.g., "AADHAAR", "PAN", "DRIVING_LICENSE"
    fileName: string;
    fileUrl: string;
    fileType?: string; // MIME type
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    uploadedAt: Date;
  }>;

  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    upiId?: string;
  };

  walletBalance: {
    currentBalance: number;
    frozenAmount: number;
    currency: string;
  };

  availability: {
    isOnline: boolean;
    lastSeen?: Date;
    schedule?: Array<{ day: string; startTime: string; endTime: string }>;
  };

  ratings: {
    averageRating: number;
    totalReviews: number;
  };

  // Status
  // ✅ Added VERIFICATION_PENDING for when they finish Step 7
  verificationStatus: "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";
  verificationReason?: string;
  isSuspended: boolean;
  suspendReason?: string;

  // Extra
  portfolioUrls: string[];
  deviceToken?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  // GeoJSON
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    lastUpdated: Date;
  };

  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const TechnicianSchema: Schema<TechnicianDocument> = new Schema(
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
    phone: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    bio: { type: String },
    
    // ✅ Onboarding Fields
    experienceSummary: { type: String, default: "" },
    onboardingStep: { type: Number, default: 1 }, 
    
    // Keeping your String ID definition (Change to Schema.Types.ObjectId if using Refs later)
    categoryIds: [{ type: String, index: true }],
    subServiceIds: [{ type: String, index: true }],
    zoneIds: [{ type: String, index: true }],

    // ✅ Updated Document Schema
    documents: [
      {
        type: { type: String, required: true }, // e.g. "AADHAAR"
        fileName: String,
        fileUrl: { type: String, required: true },
        fileType: String,
        status: { 
          type: String, 
          enum: ["PENDING", "APPROVED", "REJECTED"], 
          default: "PENDING" 
        },
        rejectionReason: String,
        uploadedAt: { type: Date, default: Date.now }
      },
    ],

    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      upiId: String,
    },

    walletBalance: {
      currentBalance: { type: Number, default: 0 },
      frozenAmount: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },

    availability: {
      isOnline: { type: Boolean, default: false, index: true },
      lastSeen: Date,
      schedule: [
        {
          day: String,
          startTime: String,
          endTime: String,
        },
      ],
    },

    ratings: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },

    verificationStatus: {
      type: String,
      // ✅ Added VERIFICATION_PENDING
      enum: ["PENDING", "VERIFICATION_PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    verificationReason: String,
    
    isSuspended: { type: Boolean, default: false },
    suspendReason: String,

    portfolioUrls: [{ type: String }],
    deviceToken: { type: String },

    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: "2dsphere",
      },
      lastUpdated: Date,
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const TechnicianModel: Model<TechnicianDocument> =
  mongoose.models.Technician ||
  mongoose.model<TechnicianDocument>("Technician", TechnicianSchema);