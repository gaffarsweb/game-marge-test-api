import { Request, Response } from "express";
import { GamergeCoinConfigurationService } from "../services/GamergeCoinConfiguration.service";
import { logger } from "../utils/logger";
import { CustomError } from "../utils/custom-error";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";
import { Schema } from "mongoose";
import { IUpdateGame } from '../interfaces/game.interface';
import { IPagination } from "../interfaces/news.interface";

class GamergeCoinConfigurationController {

    private gamergeService: GamergeCoinConfigurationService;
    
    constructor(gamergeService: GamergeCoinConfigurationService = new GamergeCoinConfigurationService()) {
        this.gamergeService = gamergeService;
    }

    public addGamergeConfiguration = async (req: Request, res: Response): Promise<any> => {
        try {
            
            const payload = req.body;

            const result = await this.gamergeService.addGamergeConfiguration(payload);
            if (!result.status) {
                return sendErrorResponse(res, result.code, result.msg);
            }

            return sendSuccessResponse(res, result.code, result.data);
        } catch (error: any) {
            logger.error('addGamergeConfiguration Error:', error);
            return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGE.INTERNAL_SERVER_ERROR);
        }
    };

    public getGamergeConfiguration = async (req: Request, res: Response): Promise<any> => {
        try {
            
            const result = await this.gamergeService.getGamergeConfiguration();
            if (!result.status) {
                return sendErrorResponse(res, result.code, result.msg);
            }

            return sendSuccessResponse(res, result.code, result.data);
        } catch (error: any) {
            logger.error('addGamergeConfiguration Error:', error);
            return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGE.INTERNAL_SERVER_ERROR);
        }
    };

    public getUserPossibleCoinsDetails = async (req: Request, res: Response): Promise<any> => {
        try {
            
            const userId = req.params.userId;

            const result = await this.gamergeService.getUserPossibleCoinsDetails(userId);
            if (!result.status) {
                return sendErrorResponse(res, result.code, result.msg);
            }

            return sendSuccessResponse(res, result.code, result.data);
        } catch (error: any) {
            logger.error('addGamergeConfiguration Error:', error);
            return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGE.INTERNAL_SERVER_ERROR);
        }
    };

    public buyGamergeTokens = async (req: Request, res: Response): Promise<any> => {
        try {
            
            const userId = req.params.userId;
            const payload = req.body;
            const result = await this.gamergeService.buyGamergeTokens(userId, payload);
            if (!result.status) {
                return sendErrorResponse(res, result.code, result.msg);
            }

            return sendSuccessResponse(res, result.code, result.data);
        } catch (error: any) {
            logger.error('addGamergeConfiguration Error:', error);
            return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_MESSAGE.INTERNAL_SERVER_ERROR);
        }
    };
}

export default new GamergeCoinConfigurationController();