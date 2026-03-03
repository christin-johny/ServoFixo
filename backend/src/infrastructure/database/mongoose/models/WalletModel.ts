import mongoose, { Schema, Document, Model } from "mongoose";

export interface WalletDocument extends Document {
  technicianId: string;
  balances: {
    pending: number;
    withdrawable: number;
    locked: number;
    totalEarned: number;
  };
  metadata?: {
    lastPayoutAt?: Date;
    bankDetailsSnapshot?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<WalletDocument>(
  {
    technicianId: { type: String, required: true, unique: true, index: true },
    balances: {
      pending: { type: Number, default: 0 },
      withdrawable: { type: Number, default: 0 },
      locked: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
    },
    metadata: {
      lastPayoutAt: Date,
      bankDetailsSnapshot: String,
    },
  },
  { timestamps: true }
);

export const WalletModel: Model<WalletDocument> = mongoose.model<WalletDocument>("Wallet", WalletSchema);