import { Request, Response } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { NotificationServices } from '../services/notification.service';
import { Schema } from 'mongoose';
import { logger } from '../utils/logger';
import { CustomError } from '../utils/custom-error';
import { HTTP_MESSAGE } from '../utils/httpStatus';
import { IPagination } from '../interfaces/news.interface';
import { CustomRequest } from '../interfaces/auth.interface';

class NotificationController {
    constructor(private notificationServices: NotificationServices = new NotificationServices()) { }
    createNotification = async (req: Request, res: Response): Promise<any> => {
        logger.info("Create notification endpoint hit.");
        try {
            const newItem = await this.notificationServices.createNotification(req?.body);
            logger.info("Notification created successfully");
            return sendSuccessResponse(res, "ok", newItem);
        } catch (error: any) {
            logger.error(`Failed to create notification: ${error}`);
            return sendErrorResponse(res, error, error.message);
        }
    }
    getUnreadCount = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Get unread count endpoint hit.");
        const userId=req.user?.id  as Schema.Types.ObjectId;
        try {
            const count = await this.notificationServices.getUnreadCount(userId);
            logger.info("Unread count fetched successfully");
            return sendSuccessResponse(res, "ok", count);
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }
    markAllAsRead = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Mark all as read endpoint hit.");
        const userId=req.user?.id  as Schema.Types.ObjectId;
        try {
            await this.notificationServices.markAllAsRead(userId);
            logger.info("All notifications marked as read successfully");
            return sendSuccessResponse(res, "ok", {});
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }
    getNotifications = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Get notifications endpoint hit.");

        const { page, limit, sort, search } = req.query;
        const userId=req.user?.id  as Schema.Types.ObjectId;
        try {

            const query: IPagination = {
                page: page ? Number(page) || 1 : 1, 
                limit: limit ? Number(limit) || 10 : 10, 
                sort: sort && (Number(sort) === 1 || Number(sort) === -1) ? Number(sort) as 1 | -1 : -1, // Ensure only 1 or -1
                search: search ? String(search) : '' 
            };

            const items = await this.notificationServices.getNotifications(userId,query);
            logger.info("Notification fetched successfully");

            return sendSuccessResponse(res, HTTP_MESSAGE.OK, items);
        } catch (error: any) {
            logger.error(`Failed to get notification: ${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, error, error.message);
        }
    }
    getNotificationById = async (req: Request, res: Response): Promise<any> => {
        const { id } = (req.params as any) as { id: Schema.Types.ObjectId };
        try {
            console.log('query', req?.query)
            const items = await this.notificationServices.getNotificationById(id);
            return sendSuccessResponse(res, "ok", items);
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }


    deleteNotification = async (req: Request, res: Response): Promise<any> => {
        logger.info("Delete promotion endpoint hit.");
        try {
            const { id } = (req?.params as any) as { id: Schema.Types.ObjectId };
            await this.notificationServices.deleteNotification(id);
            return sendSuccessResponse(res, 'Notification deleted successfully');

        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }

    updateNotificaton = async (req: Request, res: Response): Promise<any> => {
        logger.info("Update promotion endpoint hit.");
        const { id } = (req?.params as any) as { id: Schema.Types.ObjectId };
        const payload = req?.body;
        try {
            const updatedItem = await this.notificationServices.updateNotification(id, payload);
            return sendSuccessResponse(res, 'notification updated', updatedItem);
        } catch (error: any) {
            return sendErrorResponse(res, error, error.message);
        }
    }

}

export default new NotificationController();