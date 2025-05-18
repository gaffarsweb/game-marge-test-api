import mongoose, { Schema, Document } from "mongoose";

// Define the Wallet document interface
interface IWallet extends Document {
    referredBy: mongoose.Types.ObjectId;
    referredTo: mongoose.Types.ObjectId;
    balance: Number;
    createdAt: Date;
    updatedAt: Date;
}


const inGameCoinReferralHistorySchema = new Schema<IWallet>(
    {
        referredBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        referredTo: {
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


const inGameCoinReferralHistory = mongoose.model<IWallet>("inGameCoinReferralHistory", inGameCoinReferralHistorySchema);
export default inGameCoinReferralHistory;
