import { Document, Schema, model, Types } from "mongoose";

// Define the structure of the rate object
interface IRateData {
  [symbol: string]: number; // Key is cryptocurrency symbol (e.g., "BTC"), value is USD rate
}

export interface IUSDRate extends Document {
  rates: IRateData;
  createdAt: Date;
  updatedAt: Date;
}

const USDRateSchema = new Schema<IUSDRate>(
  {
    rates: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  { timestamps: true }
);



export default model<IUSDRate>("USDRate", USDRateSchema);