import mongoose, { Schema, Document } from "mongoose";

export interface ISpinCombination extends Document {
  combination: string[]; // e.g., ["7", "7", "7"]
  rewardType: string;     // e.g., "GMG" or "LOOT"
  rewardAmount: number;   // e.g., 100
  description?: string;
  network: string;
}

const SpinCombinationSchema = new Schema<ISpinCombination>(
  {
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
    description: {
      type: String,
      default: ""
    },
    network: {
      type: String,
    }
  
  },
  { timestamps: true }
);

export default mongoose.model<ISpinCombination>("SpinCombination",SpinCombinationSchema);
