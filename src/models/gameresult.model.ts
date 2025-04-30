import mongoose, { Schema, Document } from 'mongoose';

export interface IGameResult extends Document {
  roomId: string;
  gameId: mongoose.Types.ObjectId;
  subGameId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  opponentId?: mongoose.Types.ObjectId; // Null for bot matches
  botId: mongoose.Types.ObjectId; 
  playerScore?: number;
  opponentScore?: number;
  opponentType: 'user' | 'bot'; 
  isBotMatch: boolean;
  status:"playing" | "finished"
  createdAt: Date;
}

const GameResultSchema = new Schema<IGameResult>(
  {
    roomId: { type: String, required: true, unique: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    subGameId: { type: Schema.Types.ObjectId, ref: 'SubGame', required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opponentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    botId: { type: Schema.Types.ObjectId, ref: 'Bot', default: null }, 
    playerScore: { type: Number,default:0 },
    opponentScore: { type: Number, default: 0 }, 
    isBotMatch: { type: Boolean, required: true },
    opponentType: { type: String, enum: ["user", "bot"], required: true },
    status: { type: String, enum: ["playing", "finished"], default: "playing" },
    createdAt: { type: Date, default: Date.now }, 
  },
  { timestamps: true } 
);


GameResultSchema.index({ createdAt: -1 });
GameResultSchema.index({ gameId: 1, subGameId: 1 });

export default mongoose.model<IGameResult>('GameResult', GameResultSchema);
