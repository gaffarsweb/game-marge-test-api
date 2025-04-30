import { Schema } from "mongoose";
import { IPromotionsPayload, IPagination, IUpdatePromotion } from "../interfaces/promotion.interface";
import  { IPromotion } from "../models/promotions.model";
import { PromotionRepository } from "../repositories/promotion.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class PromotionServices {

   constructor(private promotionRepository: PromotionRepository = new PromotionRepository()) { }
    async createPromotion(payload: IPromotionsPayload): Promise<IPromotion> {
        return await this.promotionRepository.createPromotion(payload);
    }

    async getPromotions(query: IPagination): Promise<{ result: IPromotion[], count: number }> {
        const data= await this.promotionRepository.getPromotions(query);
        if(data.result.length===0){
            throw new CustomError('No promotion found',HTTP_STATUS.NOT_FOUND);
        }
        return data;
           
    }
    async getPromotionById(id: Schema.Types.ObjectId): Promise<IPromotion | null> {
        const promotion= await this.promotionRepository.getPromotionById(id);
        if(!promotion){
            throw new CustomError('Promotion not found',HTTP_STATUS.NOT_FOUND);
        }
        return promotion;
    }
    async deletePromotion(id: Schema.Types.ObjectId):Promise<void> {
        await this.promotionRepository.deletePromotion(id);   
       
    }
    async updatePromotion(id: Schema.Types.ObjectId, payload: IUpdatePromotion):Promise<IPromotion | null> {
        return await this.promotionRepository.updatePromotion(id, payload);
    }
}

