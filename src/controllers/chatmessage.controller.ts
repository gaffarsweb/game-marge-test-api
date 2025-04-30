import { Request, Response } from 'express';
import { CustomRequest } from '../interfaces/auth.interface';
import { logger } from '../utils/logger';
import { ChatMessageService } from '../services/chatmessage.service';
import { getReceiverSocketId } from '../utils/socket';
import { io } from '../server';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { CustomError } from '../utils/custom-error';

class ChatMessageController {

    constructor(private chatMessageService: ChatMessageService = new ChatMessageService()) { }
    sendMessage = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Send message endpoint hit.");
        const isAdmin = req.user?.role === "admin";
        const senderId=isAdmin?(process.env.ADMIN_USER_ID || "67f4f4991fa9101b48031582"):req.user?.id;

        const receiverId = isAdmin ? req.query.id : (process.env.ADMIN_USER_ID || "67f4f4991fa9101b48031582");
        
        const payload={
         senderId,
         receiverId,
         text:req.body.text,
        }
       console.log("Payload:",payload)
        try{
            const newMessage=await this.chatMessageService.addNewMessage(payload);
            logger.info("New message added successfully.");
            const recieverSocket = getReceiverSocketId(payload.receiverId + "") as string;
            io.to(recieverSocket).emit('newMessage', newMessage)
            return sendSuccessResponse(res, "Message sent successfully", newMessage)
        } catch (error: any) {
            logger.error("Error while sending new message", error)
            return sendErrorResponse(res, error?.message || "Error while sending new message")
        }
    }

    // Get All the message between two users;
    getAllMessages = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Get all messages endpoint hit. ");
        const myId=process.env.ADMIN_USER_ID || "67f4f4991fa9101b48031582";
        const userToChatId=req.params.id;
        try {
            const messages = await this.chatMessageService.findConverisationOfTwoUsers({ senderId: myId, receiverId: userToChatId });
            return sendSuccessResponse(res, "Messages fetched successfully", messages);
        } catch (error: any) {
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            return sendErrorResponse(res, error, "Error while getting messages")
        }
    }

    getUsersWhoHasMessaged = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Get all messages endpoint hit. ");
        try {
            console.log("get users who has messaged api is getting called")
            const { page, limit, sort, search, filter } = req.query as { page?: string, limit?: string, sort?: string, search?: string, filter?: string };
            const messages = await this.chatMessageService.getUsersWhoHasMessaged({ page, limit, sort, search, filter });
            return res.status(200).json(messages);

        } catch (error: any) {
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            return sendErrorResponse(res, error, "Error while getting messages")
        }
    }

}

export default new ChatMessageController();