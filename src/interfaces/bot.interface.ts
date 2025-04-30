import { Schema } from "mongoose";
import { IBot } from "../models/bot.model";

export interface IBotRepository {
    createBot(bot: IBotPayload): Promise<IBot>;
    getAllBots(): Promise<{ data: IBot[]; count: number }>;
    getBotById(botId: Schema.Types.ObjectId): Promise<IBot | null>;
    getBotByName(botName: string): Promise<IBot | null>
    removeBot(botId:Schema.Types.ObjectId): Promise<IBot>;
    updateBot(botId:Schema.Types.ObjectId, updatedBot: IUpdateBot): Promise<IBot>;
}

export interface IBotPayload{
    name: string;
    winChance: number;
    avatarUrl?:string;
}
export interface IUpdateBot{
    name?: string;
    winChance?: number;
    avatarUrl?: string;
}