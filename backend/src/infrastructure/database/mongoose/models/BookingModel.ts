// src/infrastructure/database/mongoose/models/BookingModel.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import { 
  BookingStatus, 
  PaymentStatus 
} from "../../../../../../shared/types/value-objects/BookingTypes";

export interface BookingDocument extends Document {
  customerId: string;
  technicianId?: string;
  serviceId: string;
  zoneId: string;
  
  status: BookingStatus;
  
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
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
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "TIMEOUT" | "BUSY" | "CANCELLED_BY_SYSTEM";
    adminForced: boolean;
    rejectionReason?: string;
  }>;
  
  assignmentExpiresAt?: Date; // For index queries

  extraCharges: Array<{
    _id?: string; 
    id?: string;  
    title: string;
    amount: number;
    description?: string;
    proofUrl?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    addedByTechId: string;
    addedAt: Date;
  }>;
  
  timeline: Array<{
    status: BookingStatus;
    changedBy: string;
    timestamp: Date;
    reason?: string;
    meta?: any;
  }>;
  
  chatId?: string;

  meta: {
    otp?: string;
    instructions?: string;
    aiSummaryUrl?: string;
  };

  timestamps: {
    createdAt: Date;
    scheduledAt?: Date;
    updatedAt: Date;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
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
      enum: [
        "REQUESTED", "ASSIGNED_PENDING", "ACCEPTED", "EN_ROUTE", "REACHED", 
        "IN_PROGRESS", "EXTRAS_PENDING", "COMPLETED", "PAID", "CANCELLED", 
        "FAILED_ASSIGNMENT", "DISPUTED", "CLOSED"
      ],
      default: "REQUESTED"
    },
    
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
      status: { 
        type: String, 
        enum: ["PENDING", "CAPTURED", "FAILED", "REFUNDED"], 
        default: "PENDING" 
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      amountPaid: { type: Number, default: 0 }
    },
    
    candidateIds: [{ type: String }],
    
    assignedTechAttempts: [{
      techId: { type: String, required: true },
      attemptAt: { type: Date, required: true },
      expiresAt: { type: Date, required: true },
      status: { 
        type: String, 
        enum: ["PENDING", "ACCEPTED", "REJECTED", "TIMEOUT", "BUSY", "CANCELLED_BY_SYSTEM"],
        default: "PENDING"
      },
      adminForced: { type: Boolean, default: false },
      rejectionReason: String
    }],
    
    assignmentExpiresAt: { type: Date, index: true }, // Index for fast cron lookup

    extraCharges: [{
      title: { type: String, required: true },
      amount: { type: Number, required: true },
      description: String,
      proofUrl: String,
      status: { 
        type: String, 
        enum: ["PENDING", "APPROVED", "REJECTED"], 
        default: "PENDING" 
      },
      addedByTechId: String,
      addedAt: { type: Date, default: Date.now }
    }],
    
    timeline: [{
      status: { type: String, required: true },
      changedBy: { type: String, required: true }, // e.g. "customer", "tech:ID"
      timestamp: { type: Date, default: Date.now },
      reason: String,
      meta: Schema.Types.Mixed
    }],
    
    chatId: String,
    
    meta: {
      otp: String,
      instructions: String,
      aiSummaryUrl: String
    },

    timestamps: {
      createdAt: { type: Date, default: Date.now },
      scheduledAt: Date,
      updatedAt: { type: Date, default: Date.now },
      acceptedAt: Date,
      startedAt: Date,
      completedAt: Date,
      cancelledAt: Date
    },

    isDeleted: { type: Boolean, default: false }
  },
  { 
    timestamps: true 
  }
);

// Compound indexes for common query patterns
BookingSchema.index({ technicianId: 1, status: 1 });
BookingSchema.index({ customerId: 1, status: 1 });
BookingSchema.index({ "timestamps.scheduledAt": 1 });

export const BookingModel: Model<BookingDocument> =
  mongoose.models.Booking ||
  mongoose.model<BookingDocument>("Booking", BookingSchema);