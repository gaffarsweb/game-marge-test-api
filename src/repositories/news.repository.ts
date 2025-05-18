import {
  INewsPayload,
  INewsRepository,
  IPagination,
  IUpdateNews,
} from "../interfaces/news.interface";
import { Schema } from "mongoose";
import News, { INews } from "../models/news.model";
import { formatRelativeTime } from "../utils/timeHelper";
import { logger } from "../utils/logger";

export class NewsRepository implements INewsRepository {
  async createNews(news: INewsPayload): Promise<INews> {
    return await News.create(news);
  }

  async getNews(
    query: IPagination
  ): Promise<{ result: INews[]; count: number }> {
    const { page = 1, limit = 10, sort = -1, search } = query;
    const skip = (page - 1) * limit;
    let queryPaload: any = { isActive: true };

    if (search) {
      queryPaload.$or = [
        { title: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ];
    }

    let result = await News.find(queryPaload)
      .sort({ _id: sort })
      .skip(skip)
      .limit(limit)
      .lean();

    result = result.map((item) => ({
      ...item,
      createdAtRelative: formatRelativeTime(new Date(item.createdAt)),
    }));

    const count = await News.countDocuments(queryPaload);

    return { result, count };
  }

  async getNewsById(id: Schema.Types.ObjectId): Promise<INews | null> {
    return await News.findById(id);
  }

  async updateNews(
    id: Schema.Types.ObjectId,
    news: IUpdateNews
  ): Promise<INews | null> {
    const updatedNews = await News.findByIdAndUpdate(id, news, { new: true });
    if (!updatedNews) {
      logger.error(`Promotion with id ${id} not found`);
      throw new Error(`Promotion with id ${id} not found`);
    }
    return updatedNews;
  }

  async deleteNews(id: any): Promise<void> {
   const deletedNews= await News.findByIdAndDelete(id);
    if (!deletedNews) {
      logger.error(`News with id ${id} not found`);
      throw new Error(`News with id ${id} not found`);
    }
    return ;
  }
}
