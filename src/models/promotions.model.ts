import mongoose from 'mongoose';

export interface IPromotion extends mongoose.Document {
  title: string;
  description: string;
  imgUrl: string;
  isActive: boolean;
  seekedBy: string[];
  createdAt: Date; // Add this line
  updatedAt: Date; // Add this line if you want to use the updatedAt field
}

const PromotionsSchema = new mongoose.Schema<IPromotion>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imgUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    seekedBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Promotions = mongoose.model<IPromotion>('Promotions', PromotionsSchema);

export default Promotions;
