import mongoose, { Schema, Document, Model } from "mongoose";

export interface TransactionDocument extends Document {
  walletId: string;
  bookingId?: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  category: "JOB_EARNING" | "PAYOUT" | "REFUND_RECOUP" | "BONUS" | "PENALTY";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  description?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    walletId: { type: String, required: true, index: true },
    bookingId: { type: String, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    category: { 
      type: String, 
      enum: ["JOB_EARNING", "PAYOUT", "REFUND_RECOUP", "BONUS", "PENALTY"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"], 
      default: "PENDING" 
    },
    description: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TransactionModel: Model<TransactionDocument> = mongoose.model<TransactionDocument>("Transaction", TransactionSchema);
