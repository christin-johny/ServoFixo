import mongoose, { Schema, Document } from "mongoose";

export interface PayoutDocument extends Document {
  technicianId: string;
  walletId: string;
  amount: number;
  status: string;
  weekEnding: Date;
  bankSnapshot: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  processedAt?: Date;
  adminId?: string;
}

const PayoutSchema = new Schema<PayoutDocument>({
  technicianId: { type: String, required: true, index: true },
  walletId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["PENDING", "APPROVED", "COMPLETED", "FAILED", "FLAGGED"],
    default: "PENDING" 
  },
  weekEnding: { type: Date, required: true },
  bankSnapshot: {
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  processedAt: Date,
  adminId: String
}, { timestamps: true });

export const PayoutModel = mongoose.model<PayoutDocument>("Payout", PayoutSchema);