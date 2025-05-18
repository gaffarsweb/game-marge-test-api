import { Request, Response } from 'express';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import dayjs from 'dayjs';

class dashboardController {
    constructor(private dashboardRepository: DashboardRepository = new DashboardRepository()) { }
    getdashboard = async (req: Request, res: Response): Promise<void> => {
        try {
            const dashboard = await this.dashboardRepository.getdashboard();
            sendSuccessResponse(res, "ok", dashboard);
        } catch (error: any) {
            logger.error(`Error retrieving dashboard: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }

    upsertdashboard = async (req: Request, res: Response): Promise<void> => {
        try {
            const dashboard = await this.dashboardRepository.upsertdashboard(req.body);
            sendSuccessResponse(res, "ok", dashboard);
        } catch (error: any) {
            logger.error(`Error updating dashboard: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }

    deletedashboard = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.dashboardRepository.deletedashboard();
            if (result.deletedCount) {
                sendSuccessResponse(res, "dashboard deleted successfully");
            } else {
                sendSuccessResponse(res, "No dashboard found to delete");
            }
        } catch (error: any) {
            logger.error(`Error deleting dashboard: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }
    getBotStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.dashboardRepository.getBotStats();
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving bot stats: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }

    getUserStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.dashboardRepository.getUserStats();
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving user stats: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }
    getMatchStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.dashboardRepository.getMatchStats();
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving match stats: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }
    getGameStats = async (req: Request, res: Response): Promise<void> => {
      try {
        const stats = await this.dashboardRepository.getGameStats();
        sendSuccessResponse(res, "ok", stats);
    } catch (error: any) {
        logger.error(`Error retrieving game stats: ${error.message}`)
        sendErrorResponse(res, error, error.message);
    }
    }
    getActiveUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { start, end } = req.query;
            const stats = await this.dashboardRepository.getActiveUsersBetweenDates(
                start as string,
                end as string
            );
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving active users: ${error.message}`);
            sendErrorResponse(res, error, error.message);
        }
    }
    
    getTotalUsersByDate = async (req: Request, res: Response): Promise<void> => {
        try {
            const { start, end } = req.query;

            const startDate = typeof start === "string" ? start : dayjs().format("YYYY-MM-DD");
            const endDate = typeof end === "string" ? end : startDate;
        
            const totalUsers = await this.dashboardRepository.getTotalUsersBetweenDates(startDate, endDate);
            sendSuccessResponse(res, "ok", totalUsers);
        } catch (error: any) {
            logger.error(`Error retrieving total users by date: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }
}

export default new dashboardController();