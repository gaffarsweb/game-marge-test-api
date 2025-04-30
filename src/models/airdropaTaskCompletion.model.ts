import { Schema, model, Types, Document } from "mongoose";

interface IAirdropTaskCompletion extends Document {
  userId: Types.ObjectId;
  campaignId: Types.ObjectId;
  taskIndex: number;
  claimedAt: Date;
}

const AirdropTaskCompletionSchema = new Schema<IAirdropTaskCompletion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "AirdropCampaign", required: true },
    taskIndex: { type: Number, required: true },
    claimedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AirdropTaskCompletion = model<IAirdropTaskCompletion>(
  "AirdropTaskCompletion",
  AirdropTaskCompletionSchema
);
