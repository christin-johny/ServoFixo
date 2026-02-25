import mongoose, { Schema, Document, Model } from "mongoose";
import { ChatStatus, ChatRole } from "../../../../domain/value-objects/ChatSessionTypes";

export interface ChatSessionDocument extends Document {
  customerId: string;
  status: ChatStatus;
  messages: {
    role: ChatRole;
    content: string;
    timestamp: Date;
    actionMeta?: {
      suggestedCategoryId?: string;
      isDangerous?: boolean;
    };
  }[];
  summary?: {
    text: string;
    shortBullets: string[];
  };
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
  };
}

const chatSessionSchema = new Schema<ChatSessionDocument>({
  customerId: { type: String, required: true, index: true },
  status: { type: String, required: true, default: "ACTIVE" },
  messages: [{
    role: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    actionMeta: {
      suggestedCategoryId: String,
      isDangerous: Boolean
    }
  }],
  summary: {
    text: String,
    shortBullets: [String]
  },
  tokenUsage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: Date
  }
});

export const ChatSessionModel: Model<ChatSessionDocument> = mongoose.models.ChatSession || mongoose.model<ChatSessionDocument>("ChatSession", chatSessionSchema);