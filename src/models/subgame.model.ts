import mongoose, { Document, Schema } from "mongoose";

export interface ISubGame extends Document {
  gameId: Schema.Types.ObjectId;
  price: number;
  platformFee: number;
  entry: number;
  imgUrl?: string;
  network: string;
  currency: string;
  activeUsers: number;
}
const SubGameSchema = new mongoose.Schema<ISubGame>(
  {
    gameId: { type: Schema.Types.ObjectId, required: true, ref: "Game" },
    price: { type: Number, required: true },
    entry: { type: Number, required: true },
    platformFee: { type: Number, required: false },
    network: { type: String, required: true },
    currency: { type: String, required: true },
    imgUrl: { type: String, required: false },
    activeUsers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

//This will ensure the unique entry, currency and network.
SubGameSchema.index({ entry: 1, currency: 1, network: 1 }, { unique: true });

export default mongoose.model<ISubGame>("SubGame", SubGameSchema);
