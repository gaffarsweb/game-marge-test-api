import { IChatMessage } from "../models/chatmessage.model";
export interface IChatMessageRepository{
    getMessagesBtnTwoUsers(payload:ChatMessages):Promise<any[]>;
    createNewMessage(payload:IChatMessage):Promise<IChatMessage>;
}


export type ChatMessages=Pick<IChatMessage, "senderId" | "receiverId">;