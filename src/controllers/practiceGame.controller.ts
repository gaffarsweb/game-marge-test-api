import { Request, Response } from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { PracticeGameServices } from "../services/practicegame.service";
import { CustomError } from "../utils/custom-error";
import { logger } from '../utils/logger';
import { Schema } from 'mongoose';
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";
import userModel from "../models/user.model";
import Settings from "../models/setting.model";

class practiceGameController {

    constructor(private practiceGameServices: PracticeGameServices = new PracticeGameServices()) { }

    createNewPracticeGame = async (req: Request, res: Response): Promise<any> => {
        const payload = req.body
        logger.info("Create new practice  endpoint hit." + JSON.stringify(payload));
        try {
            const newSubGame = await this.practiceGameServices.create(payload);
            logger.info("Sub game created successfully.")
            return sendSuccessResponse(res, "practice game created successfully", newSubGame);
        } catch (error: any) {
            logger.error("Failed to create new practicee game", error);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }

    getAllPracticeGameByGameId = async (req: any, res: Response): Promise<any> => {
        logger.info("Get all subgames endpoint hit.");
        const { gameId } = (req.params as any) as { gameId: Schema.Types.ObjectId }
        const { page, limit, sort, search } = req.query;
        // const userId = req.user?.id!;


        try {
            // if (userId) {
            //     const userDetails = await userModel.findById(userId);
            //     const settingDetails = await Settings.findOne(); // Assuming single settings doc

            //     if (
            //         userDetails &&
            //         settingDetails &&
            //         (userDetails.playedPracticeGame ?? 0) >= settingDetails.practiceGameLimit
            //     ) {
            //         return sendErrorResponse(
            //             res,
            //             null,
            //             'You have reached your practice game limit. Please try again after 24 hours.',
            //             HTTP_STATUS.TOO_MANY_REQUESTS
            //         );
            //     }
            // }


            const query: any = {
                page: page ? Number(page) || 1 : 1, // Default to 1 if invalid
                limit: limit ? Number(limit) || 10 : 10, // Default to 10 if invalid
                sort: sort && (Number(sort) === 1 || Number(sort) === -1) ? Number(sort) as 1 | -1 : -1, // Ensure only 1 or -1
                search: search ? String(search) : '' // Ensure search is always a string

            };
            const subgames = await this.practiceGameServices.getAllPracticeGameByGameId(gameId, query);
            logger.info("Subgames retrieved successfully.");
            return sendSuccessResponse(res, "practive game retrieved successfully.", subgames);
        } catch (error: any) {
            logger.error(`Failed to retrieve subgames, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    getSubgame = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get subgame endpoint hit.");
        const { practiceGameId } = (req.params as any) as { practiceGameId: Schema.Types.ObjectId }
        try {
            const subgame = await this.practiceGameServices.getSubGame(practiceGameId);
            logger.info("Subgame retrieved successfully.");
            return sendSuccessResponse(res, "practice game retrieved successfully.", subgame);
        } catch (error: any) {
            logger.error(`Failed to retrieve subgame, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    updateSubgame = async (req: Request, res: Response): Promise<any> => {
        logger.info("Update subgame endpoint hit.");
        const { practiceGameId } = (req.params as any) as { practiceGameId: Schema.Types.ObjectId };
        const payload = req.body as any;
        try {
            const subgame = await this.practiceGameServices.update(practiceGameId, payload);
            logger.info("Subgame updated successfully.");
            return sendSuccessResponse(res, "practice game updated successfully.", subgame);
        } catch (error: any) {
            logger.error(`Failed to delete subgame, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    deleteSubgame = async (req: Request, res: Response): Promise<any> => {
        logger.info("Delete subgame endpoint hit.");
        const { practiceGameId } = (req.params as any) as { practiceGameId: Schema.Types.ObjectId }
        try {
            const subgame = await this.practiceGameServices.delete(practiceGameId);
            logger.info("Subgame deleted successfully.");
            return sendSuccessResponse(res, "practice game deleted successfully.", subgame);
        } catch (error: any) {
            logger.error(`Failed to delete subgame, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    playPracticeGame = async (req: any, res: Response): Promise<any> => {
        logger.info("Delete subgame endpoint hit.");
        const userId = req.user?.id!;

        const { practiceGameId } = (req.params as any) as { practiceGameId: Schema.Types.ObjectId }
        try {
            if (userId) {
                const userDetails = await userModel.findById(userId);
                const settingDetails = await Settings.findOne(); // Assuming single settings doc

                if (
                    userDetails &&
                    settingDetails &&
                    Number(userDetails.playedPracticeGame ?? 0) >= Number(settingDetails.practiceGameLimit)

                ) {
                    return sendErrorResponse(
                        res,
                        null,
                        'You have reached your practice game limit. Please try again after 24 hours.',
                        HTTP_STATUS.TOO_MANY_REQUESTS
                    );
                }
            }
            const subgame = await this.practiceGameServices.playPracticeGame(practiceGameId, userId);
            if (subgame && !subgame.status) {
                return sendErrorResponse(res, subgame, subgame?.msg, HTTP_STATUS.NOT_FOUND)

            } else {
                return sendSuccessResponse(res, "game started.", subgame);
            }
        } catch (error: any) {
            logger.error(`Failed to delete subgame, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    practiceGameFinished = async (req: any, res: Response): Promise<any> => {
        logger.info("Delete subgame endpoint hit.");
        const userId = req.user?.id!;
        const { winingPoints } = req.body;

        const { practiceGameId } = (req.params as any) as { practiceGameId: Schema.Types.ObjectId }
        try {
            const subgame = await this.practiceGameServices.practiceGameFinished(practiceGameId, userId, winingPoints);
            if (subgame && !subgame.status) {
                return sendErrorResponse(res, subgame, subgame?.msg, HTTP_STATUS.NOT_FOUND)

            } else {
                return sendSuccessResponse(res, "game finished.", subgame);
            }
        } catch (error: any) {
            logger.error(`Failed to delete subgame, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
}

export default new practiceGameController();