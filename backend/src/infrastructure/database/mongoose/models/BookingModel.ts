import mongoose, { Schema, Document, Model } from "mongoose";
import { 
  BookingStatus, 
  PaymentStatus 
} from "../../../../../../shared/types/value-objects/BookingTypes";

export interface BookingDocument extends Document {
  customerId: string;
  technicianId?: string;
  completionPhotos?: string[];
  serviceId: string;
  zoneId: string;
  
  status: BookingStatus;
  
  // NEW: Historical Data Snapshots
  snapshots: {
    technician?: {
      name: string;
      phone: string;
      avatarUrl?: string; // Changed from photoUrl to match Tech Model
      rating: number;
    };
    customer: {
      name: string;
      phone: string;
      avatarUrl?: string;
    };
    service: {
      name: string;
      categoryId: string;
    };
  };
isRated: boolean;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    mapLink?: string;
  };

  pricing: {
    estimated: number;
    final?: number;
    deliveryFee: number;
    discount?: number;
    tax?: number;
  };

  payment: {
    status: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    amountPaid?: number;
  };
  
  candidateIds: string[];
  
  assignedTechAttempts: Array<{
    techId: string;
    attemptAt: Date;
    expiresAt: Date;
    status: string;
    adminForced: boolean;
    rejectionReason?: string;
  }>;
  
  assignmentExpiresAt?: Date;

  extraCharges: Array<any>; // Simplified for brevity, keep your full schema
  timeline: Array<any>;
  chatId?: string;
  meta: any;
  timestamps: {
    createdAt: Date;
    scheduledAt?: Date;
    updatedAt: Date;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  };

  isDeleted: boolean;
}

const BookingSchema: Schema<BookingDocument> = new Schema(
  {
    customerId: { type: String, required: true, index: true },
    technicianId: { type: String, index: true, default: null },
    serviceId: { type: String, required: true },
    zoneId: { type: String, required: true, index: true },
    
    status: { 
      type: String, 
      required: true, 
      index: true,
      default: "REQUESTED"
    },
    isRated: { type: Boolean, default: false, index: true },
    snapshots: {
      technician: {
        name: String,
        phone: String,
        avatarUrl: String,
        rating: Number
      },
      customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        avatarUrl: String
      },
      service: {
        name: { type: String, required: true },
        categoryId: String
      }
    },
    // -------------------------------

    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      mapLink: String
    },

    pricing: {
      estimated: { type: Number, required: true },
      final: Number,
      deliveryFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 }
    },

    payment: {
      status: { type: String, default: "PENDING" },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      amountPaid: { type: Number, default: 0 }
    },
    
    candidateIds: [{ type: String }],
    
    assignedTechAttempts: [{
      techId: String,
      attemptAt: Date,
      expiresAt: Date,
      status: String,
      adminForced: Boolean,
      rejectionReason: String
    }],
    
    
    assignmentExpiresAt: { type: Date, index: true },
    completionPhotos: [{ type: String }],
 
    extraCharges: [{ title: String, amount: Number, status: String, addedByTechId: String }],
    timeline: [{ status: String, changedBy: String, timestamp: Date, reason: String }],
    meta: { otp: String, instructions: String },
    timestamps: { createdAt: Date, updatedAt: Date, acceptedAt: Date, startedAt: Date, completedAt: Date, cancelledAt: Date },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const BookingModel: Model<BookingDocument> =
  mongoose.models.Booking || mongoose.model<BookingDocument>("Booking", BookingSchema);