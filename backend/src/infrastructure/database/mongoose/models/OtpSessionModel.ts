import mongoose, { Document, Model, Schema } from "mongoose";
import { OtpContext } from "../../../../../../shared/types/enums/OtpContext";

export interface OtpSessionDocument extends Document {
  email: string;
  otp: string;
  context: OtpContext;
  sessionId: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const OtpSessionSchema: Schema<OtpSessionDocument> = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    otp: { type: String, required: true },
    context: {
      type: String,
      required: true,
      enum: Object.values(OtpContext),
    },
    sessionId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

OtpSessionSchema.index({ email: 1, sessionId: 1, context: 1 });

export const OtpSessionModel: Model<OtpSessionDocument> =
  mongoose.models.OtpSession ||
  mongoose.model<OtpSessionDocument>("OtpSession", OtpSessionSchema);
