import { Schema } from "mongoose";
import { INotificationPayload, IPagination, IUpdateNotification } from "../interfaces/notification.interface";
import  { INotification } from "../models/Notifications.model";
import { NotificationRepository } from "../repositories/notification.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class NotificationServices {

   constructor(private notificationRepository: NotificationRepository = new NotificationRepository()) { }
    async createNotification(payload: INotificationPayload): Promise<INotification> {
        return await this.notificationRepository.createNotification(payload);
    }
    async getUnreadCount(userId: Schema.Types.ObjectId): Promise<number> {
        return await this.notificationRepository.getUnreadCount(userId);
    }
    async markAllAsRead(userId: Schema.Types.ObjectId): Promise<void> {
        await this.notificationRepository.markAllAsRead(userId);
    }
    async getNotifications(userId:Schema.Types.ObjectId,query: IPagination): Promise<{ result: INotification[], count: number }> {
        const data= await this.notificationRepository.getNotifications(userId,query);
        if(data.result.length===0){
            throw new CustomError('No notification found',HTTP_STATUS.NOT_FOUND);
        }
        return data;
           
    }
    async getNotificationById(id: Schema.Types.ObjectId): Promise<INotification | null> {
        const notification= await this.notificationRepository.getNotificationById(id);
        if(!notification){
            throw new CustomError('Notification not found',HTTP_STATUS.NOT_FOUND);
        }
        return notification;
    }
    async deleteNotification(id: Schema.Types.ObjectId):Promise<void> {
        await this.notificationRepository.deleteNotification(id);   
       
    }
    async updateNotification(id: Schema.Types.ObjectId, payload: IUpdateNotification):Promise<INotification | null> {
        return await this.notificationRepository.updateNotification(id, payload);
    }
}

