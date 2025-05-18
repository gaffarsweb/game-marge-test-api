import mongoose from "mongoose";

export interface IBurnCoinHistory extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    burnEventId: mongoose.Types.ObjectId;
    totalSupply: number;
    burnTarget: number;
    availableToken: number;
    totalTokenBurned: number;
    burnDate: Date;
    remarks?: string;
}

const BurnCoinHistorySchema = new mongoose.Schema<IBurnCoinHistory>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        burnEventId: { type: mongoose.Schema.Types.ObjectId, ref: "BurningEvent", required: true },
        totalSupply: { type: Number, required: true },
        burnTarget: { type: Number, required: true },
        availableToken: { type: Number, required: true },
        totalTokenBurned: { type: Number, required: true },
        burnDate: { type: Date, default: Date.now },
        remarks: { type: String },
    },
    { timestamps: true }
);
export default mongoose.model<IBurnCoinHistory>("BurnCoinHistory", BurnCoinHistorySchema);