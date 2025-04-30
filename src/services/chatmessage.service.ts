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
    async addNewMessage(payload: any): Promise<any> {
        const newMessage = await this.chatMessageRepository.createNewMessage(payload);
        return newMessage;
    }

    async getUsersWhoHasMessaged(query: { page?: string, limit?: string, sort?: string, search?: string, filter?: string }): Promise<any> {
        const newMessage = await this.chatMessageRepository.getUsersWhoHasMessaged(query);
        return newMessage;
    }
}