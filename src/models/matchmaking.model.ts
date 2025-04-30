import mongoose, { Document,Schema } from "mongoose";

export interface IMatchMaking extends Document{
    userId: Schema.Types.ObjectId;
    gameId: Schema.Types.ObjectId;
    subGameId: Schema.Types.ObjectId;
    socketId: string;
    status: string;
    createdAt: Date;
}
 
const matchmakingSchema = new mongoose.Schema<IMatchMaking>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    subGameId: { type: mongoose.Schema.Types.ObjectId, required: true },
    socketId: { type: String, required: true },
    status: { type: String, enum: ["waiting", "playing", "finished"], default: "waiting" },
    createdAt: { type: Date, default: Date.now }
});


export const Matchmaking = mongoose.model<IMatchMaking>("Matchmaking", matchmakingSchema);
