import mongoose, { Document, Schema } from "mongoose";

export interface ISubGame extends Document {
    gameId: Schema.Types.ObjectId;
    price: string;
    entry: number;
    imgUrl?: string,
    name?: string,
}
const practiceGameSchema = new mongoose.Schema<ISubGame>({
    gameId: { type: Schema.Types.ObjectId, required: true, ref: "Game" },
    price: { type: String, required: true },
    entry: { type: Number, required: true },
    imgUrl: { type: String, required: false },
    name:{type:String,default:""}

}, { timestamps: true })

export default mongoose.model<ISubGame>("PracticeGames", practiceGameSchema);