import mongoose, { Schema, Document } from "mongoose";

export interface ReviewDocument extends Document {
  bookingId: string;
  customerId: string;
  technicianId: string;
  serviceId: string;  
  rating: number;
  comment?: string;
  createdAt: Date;
  isDeleted: boolean;
}

const ReviewSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: "Technician", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "ServiceItem", required: true }, 
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
 
ReviewSchema.index({ technicianId: 1, createdAt: -1 });
ReviewSchema.index({ bookingId: 1 });
ReviewSchema.index({ serviceId: 1, createdAt: -1 });  

export const ReviewModel = mongoose.model<ReviewDocument>("Review", ReviewSchema);