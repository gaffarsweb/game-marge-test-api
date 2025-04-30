import mongoose, { Schema, Document } from "mongoose";

export interface ISpinHistory extends Document {
  userId: mongoose.Types.ObjectId;
  combination: string[];
  rewardType: string;
  rewardAmount: number;
  spinFee: number;

}

const SpinHistorySchema = new Schema<ISpinHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    combination: {
      type: [String],
      required: true
    },
    rewardType: {
      type: String,
      required: true
    },
    rewardAmount: {
      type: Number,
      required: true
    },
    spinFee: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const SpinHistory = mongoose.model<ISpinHistory>("SpinHistory",SpinHistorySchema);
