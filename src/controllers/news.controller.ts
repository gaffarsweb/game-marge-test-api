import { Request, Response } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { NewsServices } from '../services/news.service';
import { Schema } from 'mongoose';
import { logger } from '../utils/logger';
import { HTTP_MESSAGE, HTTP_STATUS } from '../utils/httpStatus';
import { IPagination } from '../interfaces/news.interface';
import { CustomError } from '../utils/custom-error';


class NewsController {
    constructor(private newsServices: NewsServices = new NewsServices()) {}

     createItem=async(req: Request, res: Response):Promise<any>=> {
        try {
             const newItem = await this.newsServices.createNews(req?.body);
             return sendSuccessResponse(res, 'News created successfully', newItem,HTTP_STATUS.CREATED);
        } catch (error: any) {
           return  sendErrorResponse(res,error,error.message);
        }
    }

    getItems = async (req: Request, res: Response): Promise<any> => {
    
        const { page, limit, sort, search } = req.query;
    
        try {
            const query: IPagination= {
                page: page ? Number(page) || 1 : 1, // Default to 1 if invalid
                limit: limit ? Number(limit) || 10 : 10, // Default to 10 if invalid
                sort: sort && (Number(sort) === 1 || Number(sort) === -1) ? Number(sort) as 1 | -1 : -1, // Ensure only 1 or -1
                search: search ? String(search) : '' // Ensure search is always a string

            };
    
            const items = await this.newsServices.getNewss(query);
    
            return sendSuccessResponse(res, HTTP_MESSAGE.OK, items);
        } catch (error: any) {
            logger.error(`Failed to get news: ${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, error, error.message);
        }
    };
    
    getNewsById=async(req:Request, res:Response):Promise<any>=> {
        const {id}=(req.params as any) as {id:Schema.Types.ObjectId};
        try {
            const items = await this.newsServices.getNewsById(id);
           return sendSuccessResponse(res,"ok",items);
        } catch (error:any) {
           return sendErrorResponse(res,error,error.message);
        } 
    }
    deleteItem = async (req: Request, res: Response): Promise<any> => {
        try{
            const { id } = (req?.params as any) as { id: Schema.Types.ObjectId };  
                await this.newsServices.deleteNews(id);
                return sendSuccessResponse(res, 'News deleted successfully');

        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }

    updateItem = async (req: Request, res: Response): Promise<any> => {
        const { id } = (req?.params as any) as { id: Schema.Types.ObjectId };  
        const payload = req?.body;
        try {
            const updatedItem = await this.newsServices.updateNews(id, payload);
            return sendSuccessResponse(res, 'news updated', updatedItem);
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }

}

export default new NewsController();
