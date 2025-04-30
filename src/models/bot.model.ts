import mongoose, { Document } from "mongoose";

export interface IBot extends Document {
    name: string;
    winChance: number;
    avatarUrl:string;
    status:"playing" | "idle"
}

const botSchema = new mongoose.Schema<IBot>({
    name: { type: String, required: true,unique: true},
    winChance: { type: Number, required: true },
    avatarUrl: { type: String,trim:true },
    status: { type: String, enum: ["playing", "idle"], default: "idle" }
},{timestamps:true});

export const Bot = mongoose.model<IBot>("Bot", botSchema);
