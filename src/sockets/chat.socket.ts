// sockets/chat.socket.ts
import { Server, Socket } from "socket.io";
import ChatMessage from "../models/chatmessage.model";
import { getReceiverSocketId } from "./game.socket"; 
import { logger } from "../utils/logger";

export function setupChatSockets(io: Server, socket: Socket) {
  const userId = socket.handshake.query.userId as string;
  if (!userId) return;


   // 1. User sends message
   socket.on("sendMessage", async ({ senderId, text, isAdmin, receiverId }) => {
    try {
      const actualSenderId = isAdmin ? (process.env.ADMIN_USER_ID || "67f0c16d590de0594bc56742"): senderId;
      const actualReceiverId = isAdmin ? receiverId : (process.env.ADMIN_USER_ID || "67f0c16d590de0594bc56742");
      const message = await ChatMessage.create({
        senderId: actualSenderId,
        receiverId: actualReceiverId,
        text,
        isRead: false
      });

      // Emit to receiver
      const receiverSocketId = getReceiverSocketId(actualReceiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }

      // Acknowledge back to sender
      socket.emit("messageSent", message);
    } catch (error) {
      logger.error(`Error sending message: ${error}`);
      socket.emit("error", "Failed to send message");
    }
  });

  // 2. Mark all messages as read
  socket.on("markMessagesRead", async ({ userId, isAdmin }) => {
    const senderId=isAdmin ?userId: (process.env.ADMIN_USER_ID || "67f0c16d590de0594bc56742");
    const receiverId = isAdmin ? (process.env.ADMIN_USER_ID || "67f0c16d590de0594bc56742") : userId;
    await ChatMessage.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );
  });
}
