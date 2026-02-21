import mongoose, { Schema, Document, Model } from "mongoose";
import { 
  NotificationStatus, 
  NotificationType, 
  RecipientType, 
  NotificationPriority 
} from "../../../../domain/value-objects/NotificationTypes";

export interface NotificationDocument extends Document {
  recipientId: string;
  recipientType: RecipientType;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  imageUrl?: string;
  clickAction?: string;
  metadata: Record<string, string>;
  priority: NotificationPriority;
  status: NotificationStatus;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<NotificationDocument> = new Schema(
  {
    recipientId: { type: String, required: true, index: true },
    recipientType: { 
      type: String, 
      enum: ["TECHNICIAN", "CUSTOMER", "ADMIN"], 
      required: true 
    },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    icon: { type: String },
    imageUrl: { type: String },
    clickAction: { type: String },
    metadata: { type: Map, of: String, default: {} },
    priority: { 
      type: String, 
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], 
      default: "MEDIUM" 
    },
    status: { 
      type: String, 
      enum: ["UNREAD", "READ", "ARCHIVED"], 
      default: "UNREAD",
      index: true 
    },
    readAt: { type: Date }
  },
  { timestamps: true }
);

// Compound index for optimized "Inbox" fetching
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export const NotificationModel: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);