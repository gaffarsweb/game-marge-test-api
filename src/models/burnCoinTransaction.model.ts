import { Schema, model, Document, Types } from "mongoose";

export interface IBurningTransaction extends Document {
  userId: Types.ObjectId;
  gameId: Types.ObjectId;
  subGameId: Types.ObjectId;
  gameResultId: Types.ObjectId;
  currency: string;
  network: string;
  amountBurned: number;
  createdAt: Date;
  updatedAt: Date;
}

const BurningTransactionSchema = new Schema<IBurningTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    subGameId: { type: Schema.Types.ObjectId, ref: "SubGame", required: true },
    gameResultId: { type: Schema.Types.ObjectId, ref: "GameResult", required: true },
    currency: { type: String, required: true },
    network: { type: String, required: true },
    amountBurned: { type: Number, required: true }
  },
  { timestamps: true }
);

export default model<IBurningTransaction>("BurningTransaction", BurningTransactionSchema);
