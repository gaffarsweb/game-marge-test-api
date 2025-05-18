import { Response } from 'express';
import { CustomRequest } from '../interfaces/auth.interface';
import { logger } from '../utils/logger';
import { ChatMessageService } from '../services/chatmessage.service';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { CustomError } from '../utils/custom-error';

class ChatMessageController {

    constructor(private chatMessageService: ChatMessageService = new ChatMessageService()) { }
 
    // Get All the message between two users;
    getAllMessages = async (req: CustomRequest, res: Response): Promise<any> => {
        const myId=process.env.ADMIN_USER_ID || "67f0c16d590de0594bc56742";
        const userToChatId=req.params.id;
        try {
            const messages = await this.chatMessageService.findConverisationOfTwoUsers({ senderId: myId, receiverId: userToChatId });
            return sendSuccessResponse(res, "Messages fetched successfully", messages);
        } catch (error: any) {
            logger.error(`Error while geting all messages: ${error.message}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            return sendErrorResponse(res, error, "Error while getting messages")
        }
    }
        
    // Get all the conversations of admin
    getAllConversations = async (req: CustomRequest, res: Response): Promise<any> => {
        const myId=process.env.ADMIN_USER_ID || "67f0c16d590de0594bc56742";
        try {
            const messages = await this.chatMessageService.getAdminConversations();
            return sendSuccessResponse(res, "Conversations fetched successfully", messages);
        } catch (error: any) {
            logger.error(`Error while geting all conversations: ${error.message}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            return sendErrorResponse(res, error, "Error while getting messages")
        }
    }

    getUserDetails = async (req: CustomRequest, res: Response): Promise<any> => {
        const userId = req.params.id;
        try {
            const messages = await this.chatMessageService.getUserDetails({userId});
            return sendSuccessResponse(res, "Conversations fetched successfully", messages);
        } catch (error: any) {
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            return sendErrorResponse(res, error, "Error while getting messages")
        }
    }

}

export default new ChatMessageController();