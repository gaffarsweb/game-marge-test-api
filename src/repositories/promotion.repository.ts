import { IPromotionsPayload, IPromotionRepository, IPagination, IUpdatePromotion } from "../interfaces/promotion.interface";
import { Schema } from "mongoose";
import Promotion, { IPromotion } from "../models/promotions.model";
import { formatRelativeTime } from "../utils/timeHelper";
import { logger } from "../utils/logger";


export class PromotionRepository implements IPromotionRepository {

    async createPromotion(promotion: IPromotionsPayload): Promise<IPromotion> {
        return await Promotion.create(promotion);
    }

    async getPromotions(query: IPagination): Promise<{ result: IPromotion[]; count: number }> {
        const { page = 1, limit = 10, sort = -1, search } = query;
        logger.info(`search:${JSON.stringify(query)}`)
        const skip = (page - 1) * limit;
        let queryPaload: any = { isActive: true };

        // Add search filter for both name and description
        if (search) {
            queryPaload.$or = [
                { title: { $regex: new RegExp(search, "i") } },
                { description: { $regex: new RegExp(search, "i") } } // Search in description
            ];
        }

        let result = await Promotion.find(queryPaload)
            .sort({ "_id": sort })
            .skip(skip)
            .limit(limit);

        result = result.map(item => {
            const promotion = item as IPromotion;
            return {
                ...promotion.toObject(),
                createdAtRelative: formatRelativeTime(new Date(item.createdAt))
            };
        });

        const count = await Promotion.countDocuments(queryPaload);

        return { result, count };
    }


    async getPromotionById(id: Schema.Types.ObjectId): Promise<IPromotion | null> {
        return await Promotion.findById(id);
    }

    async updatePromotion(id: Schema.Types.ObjectId, promotion: IUpdatePromotion): Promise<IPromotion | null> {
        return await Promotion.findByIdAndUpdate(id, promotion, { new: true });
    }

    async deletePromotion(id: any): Promise<void> {
        await Promotion.findByIdAndDelete(id);
    }

}