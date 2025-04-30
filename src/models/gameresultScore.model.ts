import mongoose, { Schema, Document } from 'mongoose';

export interface GgameresultScore extends Document {
  gameId: mongoose.Types.ObjectId;
  subGameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  score?: number;
  status: "playing" | "finished";
}

const GameresultScoreSchema = new Schema<GgameresultScore>(
  {
    gameId: { type: Schema.Types.ObjectId, required: true },
    subGameId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ["playing", "finished"], default: "playing" },
  },
  { timestamps: true }
);

export default mongoose.model<GgameresultScore>('GameresultScore', GameresultScoreSchema);
