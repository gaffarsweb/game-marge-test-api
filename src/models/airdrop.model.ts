import { Schema, model, Document } from "mongoose";

interface IAirdropTask {
  title: string;
  image: string;
  reward: number;
  link: string;
}

export interface IAirdropCampaign extends Document {
  title: string;
  description: string;
  bannerImage: string;
  logoImage: string;
  logoText: string;
  endAt: Date;
  isActive: boolean;
  tasks: IAirdropTask[];
  createdAt: Date;
  updatedAt: Date;
}

const AirdropTaskSchema = new Schema<IAirdropTask>(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    reward: { type: Number, required: true },
    link:{type: String, required: true},
  },
  { _id: false } // Tasks don't need their own _id
);

const AirdropCampaignSchema = new Schema<IAirdropCampaign>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    bannerImage: { type: String, required: true },
    logoImage: { type: String, required: true },
    logoText: { type: String, required: true },
    endAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    tasks: { type: [AirdropTaskSchema], default: [] },
  },
  { timestamps: true }
);

const AirdropCampaign = model<IAirdropCampaign>("AirdropCampaign", AirdropCampaignSchema);
export default AirdropCampaign;