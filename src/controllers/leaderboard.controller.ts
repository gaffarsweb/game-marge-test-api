import { Response } from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { LeaderboardServices } from "../services/leaderboard.service";
import { CustomError } from "../utils/custom-error";
import { logger } from '../utils/logger';

class leaderboardController {

    constructor(private leaderboardServices: LeaderboardServices = new LeaderboardServices()) { }

    getLeaderBoardByGameId = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id;
        const gameId = req?.params.id
        try {
            const transactions = await this.leaderboardServices.getLeaderBoardByGameId(userId, gameId);
            return sendSuccessResponse(res, "transactions retrieved successfully.", transactions);
        } catch (error: any) {
            logger.error(`Failed to retrieve transactions, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
   
}

export default new leaderboardController();