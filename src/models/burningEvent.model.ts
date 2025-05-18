import mongoose, { Schema, Document } from "mongoose";

export interface IBurningEvent extends Document {
  userId: mongoose.Types.ObjectId;
  remarks?: string;
  eventDate: Date;
  targetBurnAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BurningEventSchema = new Schema<IBurningEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    remarks: { type: String },
    eventDate: { type: Date,required: true , default: Date.now },
    targetBurnAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBurningEvent>(
  "BurningEvent",
  BurningEventSchema
);
