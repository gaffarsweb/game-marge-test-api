import { Schema } from "mongoose";
import { ChatMessageRepository } from "../repositories/chatmessage.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class ChatMessageService {

    constructor(private chatMessageRepository: ChatMessageRepository = new ChatMessageRepository()) { }

    async findConverisationOfTwoUsers(payload: any): Promise<any[]> {
        const messages = await this.chatMessageRepository.getMessagesBtnTwoUsers(payload);
        if (!messages || messages.length === 0) {
            throw new CustomError("No messages found between these two users.", HTTP_STATUS.NOT_FOUND);
        }
        return messages;
    }

    async getAdminConversations(): Promise<any> {
        const conversations = await this.chatMessageRepository.getAdminConversations();
        return conversations;
    }
    async getUserDetails({userId}: { userId: string}): Promise<any> {
        const newMessage = await this.chatMessageRepository.getUserDetails({userId});
        return newMessage;
    }
}