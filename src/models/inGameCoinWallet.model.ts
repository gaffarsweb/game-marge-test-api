import mongoose, { Schema, Document } from "mongoose";

// Define the Wallet document interface
export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}


const inGameCoinWalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    balance: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);


const InGameCoinWallet = mongoose.model<IWallet>("inGameCoinWallet", inGameCoinWalletSchema);
export default InGameCoinWallet;
