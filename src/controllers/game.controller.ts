import { Request, Response } from "express";
import { GamesService } from "../services/game.service";
import { logger } from "../utils/logger";
import { CustomError } from "../utils/custom-error";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";
import mongoose, { Schema } from "mongoose";
import { IUpdateGame } from '../interfaces/game.interface';
import { IPagination } from "../interfaces/news.interface";

class GamesController {
    private gamesService: GamesService;
    constructor(gamesService: GamesService = new GamesService()) {
        this.gamesService = gamesService;
    }

    // Get all games
    getAllGames = async (req: Request, res: Response): Promise<any> => {
        try {
            const { page = 1, limit = 10, sort = 1, search = "" } = req.query as unknown as IPagination;
            const games = await this.gamesService.getAllGames({ page, limit, sort, search });
            return sendSuccessResponse(res, "Ok", games);
        } catch (error: any) {
            logger.error("Get All Games failed");
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res);
        }
    }

    getAllGamesWithoutPagination = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get all games endpoint hit.");
        try {
            const games = await this.gamesService.getAllGamesWithoutPagination();
            return sendSuccessResponse(res, "Ok", games);
        } catch (error: any) {
            logger.error("Get All Games failed");
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res);
        }
    }
    // GET a game by id
    getGame = async (req: Request, res: Response): Promise<any> => {
        const { gameId } = (req.params as any) as { gameId: Schema.Types.ObjectId };
        try {
            const game = await this.gamesService.getGame(gameId);
            return sendSuccessResponse(res, "Ok", game);

        } catch (error: any) {
            logger.error("Get game by id failed");
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res)
        }
    }

    getGameGraphData = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get game by id endpoint hit.");

        try {
            const { gameId } = (req.params as any) as { gameId: mongoose.Types.ObjectId };
            const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
            const game = await this.gamesService.getGameGraphData(gameId, { startDate, endDate });

            logger.info("Game retrieved by Id successfully.");
            return sendSuccessResponse(res, "Ok", game);

        } catch (error: any) {
            logger.error("Get game by id failed");

            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }

            return sendErrorResponse(res);
        }
    }


    // Add a game
    addGame = async (req: Request, res: Response): Promise<any> => {
        try {
            const game = await this.gamesService.create(req.body);
            return sendSuccessResponse(res, HTTP_MESSAGE.CREATED, game, HTTP_STATUS.CREATED);
        } catch (error: any) {
            logger.error("Create Game failed");
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res);
        }
    }

    // Update a game
    updateGame = async (req: Request, res: Response): Promise<any> => {
        const { gameId } = (req.params as any) as { gameId: Schema.Types.ObjectId };
        const payload = req.body as IUpdateGame;
        try {
            const game = await this.gamesService.update(gameId, payload);
            return sendSuccessResponse(res, "Ok", game);
        } catch (error: any) {
            logger.error(`Update game failed with error: ${error.message}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res);
        }
    }

    // Delete a game
    deleteGame = async (req: Request, res: Response): Promise<any> => {
        const { gameId } = (req.params as any) as { gameId: Schema.Types.ObjectId };
        try {
            await this.gamesService.delete(gameId);
            return sendSuccessResponse(res);
        } catch (error: any) {
            logger.error("Failed to delete the game.");
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res);
        }
    }


    getGameHistories = async (req: Request, res: Response): Promise<any> => {
        const { page, limit, sort, search, filter, isExport } = req.query;
        try {
            const query: IPagination = {
                page: page ? Number(page) || 1 : 1,
                limit: limit ? Number(limit) || 10 : 10,
                sort: sort && (Number(sort) === 1 || Number(sort) === -1) ? Number(sort) as 1 | -1 : -1,
                search: search ? String(search) : '',
                filter: filter ? String(filter) : '',
                isExport: isExport === 'true'
            };

            let gameHistories;
            if (query?.isExport) {
                gameHistories = await this.gamesService.getGameHistory(query, res);
                return; 
            } else {
                gameHistories = await this.gamesService.getGameHistory(query);
            }

            return sendSuccessResponse(res, "Ok", gameHistories);
        } catch (error: any) {
            logger.error("Failed to get game histories.");
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, error, error.message);
        }
    }


}

export default new GamesController();