import { IPromotionsPayload, IPromotionRepository, IPagination, IUpdatePromotion } from "../interfaces/promotion.interface";
import { Schema } from "mongoose";
import Promotion, { IPromotion } from "../models/promotions.model";
import { formatRelativeTime } from "../utils/timeHelper";
import { logger } from "../utils/logger";
import userModel from "../models/user.model";


export class PromotionRepository implements IPromotionRepository {

    async createPromotion(promotion: IPromotionsPayload): Promise<IPromotion> {
        return await Promotion.create(promotion);
    }
     async getUnreadCount(userId: Schema.Types.ObjectId): Promise<number> {
          const user = await userModel.findById(userId).select("createdAt").lean();
          if (!user) throw new Error("User not found");
        
          return await Promotion.countDocuments({
            isActive: true,
            createdAt: { $gte: user.createdAt },
            seekedBy: { $ne: userId.toString() }, 
          });
        }
        
        async markAllAsRead(userId: Schema.Types.ObjectId): Promise<void> {
          const user = await userModel.findById(userId).select("createdAt").lean();
          if (!user) throw new Error("User not found");
        
          await Promotion.updateMany(
            {
              isActive: true,
              createdAt: { $gte: user.createdAt }, 
              seekedBy: { $ne: userId },
            },
            {
              $addToSet: { seekedBy: userId },
            }
          );
        }
        
    async getPromotions(userId: Schema.Types.ObjectId,query: IPagination): Promise<{ result: IPromotion[]; count: number }> {
         const { page = 1, limit = 10, sort = -1, search } = query;
              const skip = (page - 1) * limit;
            
              const user = await userModel.findById(userId).select("createdAt").lean();
              if (!user) throw new Error("User not found");
            
              let queryPayload: any = {
                isActive: true,
                createdAt: { $gte: user.createdAt } 
              };
            
              if (search) {
                queryPayload.$or = [
                  { title: { $regex: new RegExp(search, "i") } },
                  { description: { $regex: new RegExp(search, "i") } }
                ];
              }
            
              let result: IPromotion[] = await Promotion.find(queryPayload)
                .sort({ _id: sort })
                .skip(skip)
                .limit(limit);
            
              result = result.map(item => {
                const obj = item.toObject();
                const isRead = obj.seekedBy.includes(userId); 
                return {
                  ...obj,
                  isRead,
                  createdAtRelative: formatRelativeTime(new Date(obj.createdAt)) 
                };
              });
            
              const count = await Promotion.countDocuments(queryPayload);
            
              return { result, count };
    }


    async getPromotionById(id: Schema.Types.ObjectId): Promise<IPromotion | null> {
        return await Promotion.findById(id);
    }

    async updatePromotion(id: Schema.Types.ObjectId, promotion: IUpdatePromotion): Promise<IPromotion | null> {
        const updatedPromotion= await Promotion.findByIdAndUpdate(id, promotion, { new: true });
        if (!updatedPromotion) {
            logger.error(`Promotion with id ${id} not found`);
            throw new Error(`Promotion with id ${id} not found`);
        }
        return updatedPromotion;
    }

    async deletePromotion(id: any): Promise<void> {
       const deletedPromotion=  await Promotion.findByIdAndDelete(id);
        if (!deletedPromotion) {
            logger.error(`Promotion with id ${id} not found`);
            throw new Error(`Promotion with id ${id} not found`);
        } 
        return ;
    }

}