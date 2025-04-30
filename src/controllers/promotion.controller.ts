import { Request, Response } from 'express';
import { PromotionServices } from '../services/promotion.service';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { HTTP_MESSAGE } from '../utils/httpStatus';
import { Schema } from 'mongoose';
import { CustomError } from '../utils/custom-error';
import { IPagination } from '../interfaces/news.interface';


class PromotionController {
    constructor(private promotionServices: PromotionServices = new PromotionServices()) { }
    createPromotions = async (req: Request, res: Response): Promise<any> => {
        logger.info("Create promotion endpoint hit.");

        try {
            const promotion = await this.promotionServices.createPromotion(req?.body);
            return sendSuccessResponse(res, HTTP_MESSAGE.CREATED, promotion)
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }

    getPromotions = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get pormotions endpoint hit.");

        const { page, limit, sort, search } = req.query;

        try {

            const query: IPagination = {
                page: Number(page) > 0 ? Number(page) : 1, // Ensure page is a positive number, default to 1
                limit: Number(limit) > 0 ? Number(limit) : 10, // Ensure limit is a positive number, default to 10
                sort: sort && (Number(sort) === 1 || Number(sort) === -1) ? (Number(sort) as 1 | -1) : -1, // Ensure only 1 or -1
                search: search ? String(search) : '' // Ensure search is always a string
            };

            const items = await this.promotionServices.getPromotions(query);
            logger.info("News fetched successfully");

            return sendSuccessResponse(res, HTTP_MESSAGE.OK, items);
        } catch (error: any) {
            logger.error(`Failed to get news: ${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, error, error.message);
        }
    }
    getPromotionById = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get promotion by id endpoint hit.");
        const { id } = (req.params as any) as { id: Schema.Types.ObjectId };
        try {
            console.log('query', req?.query)
            const items = await this.promotionServices.getPromotionById(id);
            return sendSuccessResponse(res, "ok", items);
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }
    deletePromotion = async (req: Request, res: Response): Promise<any> => {
        logger.info("Delete promotion endpoint hit.");
        try {
            const { id } = (req?.params as any) as { id: Schema.Types.ObjectId };
            await this.promotionServices.deletePromotion(id);
            return sendSuccessResponse(res, 'promotion deleted successfully');

        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }

    updatePromotion = async (req: Request, res: Response): Promise<any> => {
        logger.info("Update promotion endpoint hit.");
        const { id } = (req?.params as any) as { id: Schema.Types.ObjectId };
        const payload = req?.body;
        try {
            const updatedItem = await this.promotionServices.updatePromotion(id, payload);
            return sendSuccessResponse(res, 'update promotion', updatedItem);
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }

}

export default new PromotionController();