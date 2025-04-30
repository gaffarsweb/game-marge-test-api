import { Request, Response } from 'express';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import dayjs from 'dayjs';

class dashboardController {
    constructor(private dashboardRepository: DashboardRepository = new DashboardRepository()) { }
    getdashboard = async (req: Request, res: Response): Promise<void> => {
        logger.info("Get dashboard endpoint hit...");
        try {
            const dashboard = await this.dashboardRepository.getdashboard();
            logger.info("Dashboard retrieved successfully");
            sendSuccessResponse(res, "ok", dashboard);
        } catch (error: any) {
            logger.error(`Error retrieving dashboard: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }

    upsertdashboard = async (req: Request, res: Response): Promise<void> => {
        logger.info("Update dashboard endpoint hit...");
        try {
            const dashboard = await this.dashboardRepository.upsertdashboard(req.body);
            logger.info(" Dashboard updated successfully");
            sendSuccessResponse(res, "ok", dashboard);
        } catch (error: any) {
            logger.error(`Error updating dashboard: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }

    deletedashboard = async (req: Request, res: Response): Promise<void> => {
        logger.info("Delete dashboard endpoint hit...");
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
        logger.info("Get bot stats endpoint hit...");
        try {
            const stats = await this.dashboardRepository.getBotStats();
            logger.info("Bot stats retrieved successfully");
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving bot stats: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }

    getUserStats = async (req: Request, res: Response): Promise<void> => {
        logger.info("Get user stats endpoint hit...");
        try {
            const stats = await this.dashboardRepository.getUserStats();
            logger.info("User stats retrieved successfully");
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving user stats: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }
    getMatchStats = async (req: Request, res: Response): Promise<void> => {
        logger.info("Get match stats endpoint hit...");
        try {
            const stats = await this.dashboardRepository.getMatchStats();
            logger.info("Match stats retrieved successfully");
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving match stats: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }
    getGameStats = async (req: Request, res: Response): Promise<void> => {
      logger.info("Get game stats endpoint hit...");
      try {
        const stats = await this.dashboardRepository.getGameStats();
        logger.info("Game stats retrieved successfully");
        sendSuccessResponse(res, "ok", stats);
    } catch (error: any) {
        logger.error(`Error retrieving game stats: ${error.message}`)
        sendErrorResponse(res, error, error.message);
    }
    }
    getActiveUsers = async (req: Request, res: Response): Promise<void> => {
        logger.info("Get active users endpoint hit...");
        try {
            const { start, end } = req.query;
            const stats = await this.dashboardRepository.getActiveUsersBetweenDates(
                start as string,
                end as string
            );
            logger.info("Active users retrieved successfully");
            sendSuccessResponse(res, "ok", stats);
        } catch (error: any) {
            logger.error(`Error retrieving active users: ${error.message}`);
            sendErrorResponse(res, error, error.message);
        }
    }
    
    getTotalUsersByDate = async (req: Request, res: Response): Promise<void> => {
        logger.info("Get total users by date endpoint hit...");
        try {
            const { start, end } = req.query;

            const startDate = typeof start === "string" ? start : dayjs().format("YYYY-MM-DD");
            const endDate = typeof end === "string" ? end : startDate;
        
            const totalUsers = await this.dashboardRepository.getTotalUsersBetweenDates(startDate, endDate);
            logger.info("Total users by date retrieved successfully");
            sendSuccessResponse(res, "ok", totalUsers);
        } catch (error: any) {
            logger.error(`Error retrieving total users by date: ${error.message}`)
            sendErrorResponse(res, error, error.message);
        }
    }
}

export default new dashboardController();