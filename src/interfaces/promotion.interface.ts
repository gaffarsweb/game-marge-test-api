import { Schema } from "mongoose";
import { IPromotion } from "../models/promotions.model";

export interface IPromotionRepository{
    createPromotion(news: IPromotionsPayload): Promise<IPromotion>;
    getPromotions(query: IPagination): Promise<{result:IPromotion[], count:number}>;
    getPromotionById(id: Schema.Types.ObjectId): Promise<IPromotion | null>;
    updatePromotion(id: Schema.Types.ObjectId, promotion: IUpdatePromotion): Promise<IPromotion | null>;
    deletePromotion(id: Schema.Types.ObjectId): Promise<void>;
}

export interface IPromotionsPayload{
    title: string;
    description: string;
    imgUrl: string;
    isActive: boolean;
    seekedBy?: string[];
}

export interface IUpdatePromotion{
    title?: string;
    description?: string;
    imgUrl?: string;
    isActive?: boolean;
    seekedBy?: string[];
}
export interface IPagination {
    page?: number;
    limit?: number;
    sort?: 1 | -1;
    search?:string
}
