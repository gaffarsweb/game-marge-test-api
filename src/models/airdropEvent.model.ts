
import mongoose, { Document, Schema } from 'mongoose';

export interface IAirdropEvent extends Document {
  name: string;
  description: string;
  network:string
  currency:string
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AirdropEventSchema = new Schema<IAirdropEvent>(
  {
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    description: { type: String ,default:null},
    currency: { type: String, required: true },
    network: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAirdropEvent>('AirdropEvent', AirdropEventSchema);
