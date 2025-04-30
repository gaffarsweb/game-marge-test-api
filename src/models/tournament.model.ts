import { Schema, model, Document } from 'mongoose';

export interface ITournament extends Document {
  gameId: Schema.Types.ObjectId; 
  name: string;
  startTime: Date;
  endTime: Date;
  entryFee: number;
  network: string; 
  currency: string; 
  bannerImage: string;
  winningPrice:number;
  isRewarded:boolean;
  status:"upcoming" | "ongoing" | "completed"
  rewardDistribution: Array<{
    position: number;
    amount: number;
  }>;
  isActive?: boolean; 
}
const TournamentSchema = new Schema<ITournament>({
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    name: { type: String, required: true, unique: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    entryFee: { type: Number, required: true },
    currency: { type: String, required: true }, // USDT, GMG, etc.
    network: { type: String, required: true },
    bannerImage: { type: String, required: true },
    winningPrice: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'],default: 'upcoming'},
    rewardDistribution: [
      {
        _id: false,
        position: { type: Number, required: true },
        amount: { type: Number, required: true }
      }
    ],
    isActive: { type: Boolean, default: true },
    isRewarded:{type:Boolean,default:false}
  }, { timestamps: true });
  
export default model<ITournament>('Tournament', TournamentSchema);
