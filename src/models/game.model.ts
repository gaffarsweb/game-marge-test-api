import mongoose, { Document } from "mongoose";

export interface IGame extends Document {
    name: string;
    imgUrl: string;

}
const GameSchema = new mongoose.Schema<IGame>({
    name: { type: String, required: true, unique: true },
    imgUrl: { type: String, required: true },


}, { timestamps: true })

export default mongoose.model<IGame>("Game", GameSchema);