import { INotificationPayload, INotificationRepository, IPagination, IUpdateNotification } from "../interfaces/notification.interface";
import { Schema } from "mongoose";
import Notification, { INotification } from "../models/Notifications.model";
import { formatRelativeTime } from "../utils/timeHelper";
import userModel from "../models/user.model";


export class NotificationRepository implements INotificationRepository {

    async createNotification(news: INotificationPayload): Promise<INotification> {
        return await Notification.create(news);
    }
    async getUnreadCount(userId: Schema.Types.ObjectId): Promise<number> {
      const user = await userModel.findById(userId).select("createdAt").lean();
      if (!user) throw new Error("User not found");
    
      return await Notification.countDocuments({
        isActive: true,
        createdAt: { $gte: user.createdAt },
        seekedBy: { $ne: userId.toString() }, 
      });
    }
    
    async markAllAsRead(userId: Schema.Types.ObjectId): Promise<void> {
      const user = await userModel.findById(userId).select("createdAt").lean();
      if (!user) throw new Error("User not found");
    
      await Notification.updateMany(
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
    
    async getNotifications(
      userId: Schema.Types.ObjectId,
      query: IPagination
    ): Promise<{ result: INotification[]; count: number }> {
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
    
      let result: INotification[] = await Notification.find(queryPayload)
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
    
      const count = await Notification.countDocuments(queryPayload);
    
      return { result, count };
    }
    
    async getNotificationById(id: Schema.Types.ObjectId): Promise<INotification | null> {
        return await Notification.findById(id);
    }

    async updateNotification(id: Schema.Types.ObjectId, notification: IUpdateNotification): Promise<INotification> {
        const updatedNotification = await Notification.findByIdAndUpdate(id, notification, { new: true });
        if (!updatedNotification) {
            throw new Error("Notification not found");
        }
        return updatedNotification;
    }

    async deleteNotification(id: any): Promise<void> {
        const deletedNotification = await Notification.findByIdAndDelete(id);
        if (!deletedNotification) {
            throw new Error("Notification not found");
        }
        return;
    }

}