import mongoose, {  Document } from "mongoose";

export interface IChatMessage extends Document {
    senderId: mongoose.Schema.Types.ObjectId;
    receiverId: mongoose.Schema.Types.ObjectId;
    text: string;
    createdAt: Date;
}

  
  const ChatMessageSchema = new mongoose.Schema<IChatMessage>({
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
    }
  },{timestamps:true});

const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
export default ChatMessage;
