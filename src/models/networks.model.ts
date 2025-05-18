import mongoose, { Schema, Document } from "mongoose";

interface Token {
  chainId: number;
  tokenSymbol: string;
  tokenAddress: string;
  image: string;
}

export interface INetwork extends Document {
  name: string;
  rpc: string;
  currency: string;
  image: string;
  chainId: number;
  tokens: Token[];
  createdAt?: Date;
  updatedAt?: Date;
}

const networksSchema: Schema<INetwork> = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: ''
    },
    rpc: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true
    },
    chainId: {
      type: Number,
      required: true
    },
    tokens: [
      {
        chainId: { type: Number, required: true },
        tokenSymbol: { type: String, required: true },
        tokenAddress: { type: String, required: true },
        image: { type: String, required: true },
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INetwork>("Networks", networksSchema);
