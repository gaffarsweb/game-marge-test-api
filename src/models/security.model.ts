import mongoose, { Document } from "mongoose";


const SecuritySchema = new mongoose.Schema<any>({
    whitelistIp: { type: Array, },
}, { timestamps: true })

export default mongoose.model<any>("Security", SecuritySchema);