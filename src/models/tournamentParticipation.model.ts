import { Document, Schema,model } from "mongoose";

export interface ITournamentParticipation extends Document {
    tournamentId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    score: number;
    entryAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }
const TournamentParticipationSchema = new Schema<ITournamentParticipation>({
    tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score:{ type: Number, required: true },
    entryAt: { type: Date, default: Date.now }
  }, { timestamps: true }); 

export default model<ITournamentParticipation>("TournamentParticipation", TournamentParticipationSchema);
