import mongoose, { Schema, Document, Model } from "mongoose";
import { VerificationStatus } from "../../../../domain/value-objects/TechnicianTypes";

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
 
  serviceRequests: Array<{
    serviceId: string;
    categoryId: string;
    action: "ADD" | "REMOVE";
    proofUrl?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date;
    resolvedAt?: Date;
    isDismissed: boolean; 
    isArchived: boolean;
  }>;

  zoneRequests: Array<{
    currentZoneId: string;
    requestedZoneId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date;
    resolvedAt?: Date;
    isDismissed: boolean; 
    isArchived: boolean;
  }>;
  bankUpdateRequests: Array<{
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    upiId?: string;
    proofUrl: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date;
    resolvedAt?: Date;
    isDismissed: boolean; 
    isArchived: boolean;
  }>;
 
  payoutStatus: "ACTIVE" | "ON_HOLD";

  documents: Array<{
    type: string; 
    fileName: string;
    fileUrl: string;
    fileType?: string; 
    status: "PENDING" | "APPROVED" | "VERIFICATION_PENDING" | "REJECTED";
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
    isOnJob: boolean;
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
 
    serviceRequests: [
      {
        serviceId: { type: String, required: true },
        categoryId: { type: String, required: true },
        action: { type: String, enum: ["ADD", "REMOVE"], required: true },
        proofUrl: String,
        status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
        adminComments: String,
        requestedAt: { type: Date, default: Date.now },
        resolvedAt: Date,
        isDismissed: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false }
      }
    ],

    zoneRequests: [
      {
        currentZoneId: { type: String, required: true },
        requestedZoneId: { type: String, required: true },
        status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
        adminComments: String,
        requestedAt: { type: Date, default: Date.now },
        resolvedAt: Date,
        isDismissed: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false }
      }
    ],
    bankUpdateRequests: [
      {
        accountHolderName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        upiId: String,
        proofUrl: String,
        status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
        adminComments: String,
        requestedAt: { type: Date, default: Date.now },
        resolvedAt: Date,
        isDismissed: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false }
      }
    ],
  
    payoutStatus: { type: String, enum: ["ACTIVE", "ON_HOLD"], default: "ACTIVE" },

    documents: [
      {
        type: { type: String, required: true }, 
        fileName: String,
        fileUrl: { type: String, required: true },
        fileType: String,
        status: { 
          type: String, 
          enum: ["PENDING","VERIFICATION_PENDING", "APPROVED", "REJECTED"], 
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
      isOnJob: { type: Boolean, default: false },
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
      enum: ["PENDING","VERIFICATION_PENDING", "VERIFIED", "REJECTED"],
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