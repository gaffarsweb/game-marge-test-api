import mongoose from "mongoose";

export interface IBurnCoinHistory extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    burnEventId: mongoose.Types.ObjectId;
    amount: number;
    burnDate: Date;
    remarks?: string;
}

const BurnCoinHistorySchema = new mongoose.Schema<IBurnCoinHistory>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        burnEventId: { type: mongoose.Schema.Types.ObjectId, ref: "BurningEvent", required: true },
        amount: { type: Number, required: true },
        burnDate: { type: Date, default: Date.now },
        remarks: { type: String },
    },
    { timestamps: true }
);
export default mongoose.model<IBurnCoinHistory>("BurnCoinHistory", BurnCoinHistorySchema);