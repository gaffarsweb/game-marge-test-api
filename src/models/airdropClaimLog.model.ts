import mongoose, { Document, Schema } from 'mongoose';

export interface IAirdropClaimLog extends Document {
  userId: Schema.Types.ObjectId;
  airdropId: Schema.Types.ObjectId;
  lootPointsClaimed: number;
  coinsReceived: number;
  network: string;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AirdropClaimLogSchema = new Schema<IAirdropClaimLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    airdropId: { type: Schema.Types.ObjectId, ref: 'AirdropEvent', required: true },
    lootPointsClaimed: { type: Number, required: true },
    coinsReceived: { type: Number, required: true },
    currency: { type: String, required: true },
    network: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    approvedAt: { type: Date },
    rejectedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IAirdropClaimLog>('AirdropClaimLog', AirdropClaimLogSchema);
