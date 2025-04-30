import { Schema } from "mongoose";
import { INewsPayload, IPagination, IUpdateNews } from "../interfaces/news.interface";
import  { INews } from "../models/news.model";
import { NewsRepository } from "../repositories/news.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class NewsServices {

   constructor(private newsRepository: NewsRepository = new NewsRepository()) { }
    async createNews(payload: INewsPayload): Promise<INews> {
        return await this.newsRepository.createNews(payload);
    }

    async getNewss(query: IPagination): Promise<{ result: INews[], count: number }> {
        const data= await this.newsRepository.getNews(query);
        if(data.result.length===0){
            throw new CustomError('No news found',HTTP_STATUS.NOT_FOUND);
        }
        return data;
           
    }
    async getNewsById(id: Schema.Types.ObjectId): Promise<INews | null> {
        const news= await this.newsRepository.getNewsById(id);
        if(!news){
            throw new CustomError('News not found',HTTP_STATUS.NOT_FOUND);
        }
        return news;
    }
    async deleteNews(id: Schema.Types.ObjectId):Promise<void> {
        await this.newsRepository.deleteNews(id);   
       
    }
    async updateNews(id: Schema.Types.ObjectId, payload: IUpdateNews):Promise<INews | null> {
        return await this.newsRepository.updateNews(id, payload);
    }
}

