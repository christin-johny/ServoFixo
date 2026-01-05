import mongoose, { Schema, Document, Model } from "mongoose";
import { VerificationStatus } from "../../../../../../shared/types/value-objects/TechnicianTypes";

export interface TechnicianDocument extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  
  experienceSummary?: string; 
  onboardingStep: number; 

  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  documents: Array<{
    type: string; 
    fileName: string;
    fileUrl: string;
    fileType?: string; 
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

  verificationStatus: "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";
  verificationReason?: string;
  isSuspended: boolean;
  suspendReason?: string;

  portfolioUrls: string[];
  deviceToken?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; 
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
    
    experienceSummary: { type: String, default: "" },
    onboardingStep: { type: Number, default: 1 }, 
    
    categoryIds: [{ type: String, index: true }],
    subServiceIds: [{ type: String, index: true }],
    zoneIds: [{ type: String, index: true }],

    documents: [
      {
        type: { type: String, required: true }, 
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
        type: [Number], 
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