import { Schema } from "mongoose";
import { INews } from "../models/news.model";

export interface INewsRepository{
    createNews(news: INewsPayload): Promise<INews>;
    getNews(query: IPagination): Promise<{result:INews[], count:number}>;
    getNewsById(id: Schema.Types.ObjectId): Promise<INews | null>;
    updateNews(id: Schema.Types.ObjectId, news: IUpdateNews): Promise<INews | null>;
    deleteNews(id: Schema.Types.ObjectId): Promise<void>;
}

export interface INewsPayload{
    title: string;
    description: string;
    imgUrl: string;
    isActive: boolean;
    seekedBy?: string[];
}

export interface IUpdateNews{
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
    search?:string,
    filter?: string,
    isExport?: true | false,
}
