import { Schema } from "mongoose";
import { IBotPayload, IBotRepository, IUpdateBot } from "../interfaces/bot.interface";
import { Bot, IBot } from "../models/bot.model";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";
import { logger } from "../utils/logger";

export class BotRepository implements IBotRepository {
    async createBot(bot: IBotPayload): Promise<IBot> {
        return await Bot.create(bot);
    }
    async getAllBots(
        page: number = 1,
        limit: number = 10,
        filter?: string,
        sort?: string,
        search?: string
    ): Promise<{ data: IBot[]; count: number }> {
        const query: any = {};
        logger.info(`page : ${page}, limit : ${limit}, filter:${filter},sort:${sort}, search:${search}`);


        // Apply search filter (assuming searching by name or any other field)
        if (search) {
            query.$or = [
                { name: { $regex: new RegExp(search, "i") } } // Ensure regex is correctly formatted
            ];
        }

        // Apply additional filters (Assuming it's JSON-parsable)
        if (filter) {
            try {
                Object.assign(query, JSON.parse(filter));
            } catch (error) {
                throw new CustomError("Invalid filter format", HTTP_STATUS.BAD_REQUEST);
            }
        }

        // Sorting
        let sortOption = { _id: -1 } as any; // Default sorting by newest
        if (sort) {
            try {
                sortOption = JSON.parse(sort);
            } catch (error) {
                throw new CustomError("Invalid sort format", HTTP_STATUS.BAD_REQUEST);
            }
        }

        // Pagination
        const skip = (page - 1) * limit;
        const data = await Bot.find(query).sort(sortOption).skip(skip).limit(limit);
        const count = await Bot.countDocuments(query);

        return { data, count };
    }

    async getBotById(botId: Schema.Types.ObjectId): Promise<IBot | null> {
        return await Bot.findById(botId);
    }
    async getBotByName(botName: string): Promise<IBot | null> {
        return await Bot.findOne({ name: botName });
    }
    async removeBot(botId: Schema.Types.ObjectId): Promise<IBot> {
        const deletedbot = await Bot.findByIdAndDelete(botId);
        if (!deletedbot) {
            throw new Error(`Bot with ID ${botId} not found`);
        }
        return deletedbot;
    }
    async updateBot(botId: Schema.Types.ObjectId, updatedBot: IUpdateBot): Promise<IBot> {
        const updatedBotDoc = await Bot.findByIdAndUpdate(botId, updatedBot, { new: true });
        if (!updatedBotDoc) {
            throw new Error(`Bot with ID ${botId} not found`);
        }
        return updatedBotDoc;
    }
}