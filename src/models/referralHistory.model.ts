import mongoose, { Schema, Document } from "mongoose";

// Define the Wallet document interface
interface IWallet extends Document {
    referredBy: mongoose.Types.ObjectId;
    referredTo: mongoose.Types.ObjectId;
    balance: Number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}


const referralHistorySchema = new Schema<IWallet>(
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
        currency: {
            type: String,
            default: ''
        },
        balance: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
);


const referralHistory = mongoose.model<IWallet>("referralHistory", referralHistorySchema);
export default referralHistory;
