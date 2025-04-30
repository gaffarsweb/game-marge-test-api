import mongoose, { Schema, Document } from "mongoose";

interface IBurningCoin extends Document {
  currency: string;
  totalBurningAmount: number;
  network: string;
  totalBurned: number;
}

const BurningCoinSchema = new Schema<IBurningCoin>(
  {
    currency: { type: String, required: true },
    totalBurningAmount: { type: Number, required: true, default: 0 },
    totalBurned: { type: Number, default: 0 },
    network: { type: String, required: true },
  },
  { _id: false }
);

export default mongoose.model<IBurningCoin>("BurningCoin", BurningCoinSchema);