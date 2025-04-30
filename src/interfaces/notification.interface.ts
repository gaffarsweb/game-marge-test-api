import { Schema } from "mongoose";
import { INotification } from "../models/Notifications.model";

export interface INotificationRepository{
    createNotification(news: INotificationPayload): Promise<INotification>;
    getNotifications(userId:Schema.Types.ObjectId,query: IPagination): Promise<{result:INotification[], count:number}>;
    getNotificationById(id: Schema.Types.ObjectId): Promise<INotification | null>;
    updateNotification(id: Schema.Types.ObjectId, notification: IUpdateNotification): Promise<INotification>;
    deleteNotification(id: Schema.Types.ObjectId): Promise<void>;
}

export interface INotificationPayload{
    title: string;
    description: string;
    imgUrl: string;
    isActive: boolean;
    seekedBy?: string[];
}

export interface IUpdateNotification{
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
    search?: string;
}
