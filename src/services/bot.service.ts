import { Schema } from "mongoose";
import { IBotPayload, IUpdateBot } from "../interfaces/bot.interface";
import { IBot } from "../models/bot.model";
import { BotRepository } from "../repositories/bot.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class BotService {
    constructor(private botRepository: BotRepository = new BotRepository()) { }

    async getAllBots(query: any) {
        const { page = 1, limit = 10, filter, sort, search } = query;
        const bots = await this.botRepository.getAllBots(Number(page), Number(limit), filter, sort, search);

        if (bots.data.length === 0) {
            throw new CustomError("No bots found", HTTP_STATUS.NOT_FOUND);
        }

        return bots;
    }

    async getBotById(botId: Schema.Types.ObjectId): Promise<IBot | null> {
        const bot = await this.botRepository.getBotById(botId);
        if (!bot) throw new CustomError("Bot not found", HTTP_STATUS.NOT_FOUND);
        return bot;
    }
    async createNewBot(bot: IBotPayload): Promise<IBot> {
        const isBotAlreadyExists = await this.botRepository.getBotByName(bot.name);
        if (isBotAlreadyExists) throw new CustomError("Bot with the same name already exists", HTTP_STATUS.CONFLICT);
        return await this.botRepository.createBot(bot);
    }
    async removeBot(botId: Schema.Types.ObjectId): Promise<IBot> {
        return await this.botRepository.removeBot(botId);
    }
    async updateBot(botId: Schema.Types.ObjectId, updatedBot: IUpdateBot): Promise<IBot> {
        const bot = await this.botRepository.updateBot(botId, updatedBot);
        if (!bot) throw new CustomError("Bot not found", HTTP_STATUS.NOT_FOUND);
        return bot;
    }
}