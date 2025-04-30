import { Request, Response } from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { ReferralServices } from "../services/referral.service";
import { CustomError } from "../utils/custom-error";
import { logger } from '../utils/logger';

class referralCollection {

    constructor(private referralServices: ReferralServices = new ReferralServices()) { }


    getReferralListByUserId = async (req: any, res: Response): Promise<any> => {
        logger.info("Get all wallet endpoint hit.");
        try {
            const { page, limit, sort, search } = req.query;
            const userId = req.params.id

            const query: any = {
                page: Number(page) > 0 ? Number(page) : 1, // Ensure page is a positive number, default to 1
                limit: Number(limit) > 0 ? Number(limit) : 10, // Ensure limit is a positive number, default to 10
                sort: sort && (Number(sort) === 1 || Number(sort) === -1) ? (Number(sort) as 1 | -1) : -1, // Ensure only 1 or -1
                search: search ? String(search) : '' // Ensure search is always a string
            };

            const wallet = await this.referralServices.getReferralListByUserId(query, userId);
            logger.info("wallet retrieved successfully.");
            return sendSuccessResponse(res, "referral history retrieved successfully.", wallet);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    getAllReferralHistory = async (req: any, res: Response): Promise<any> => {
        logger.info("Get all wallet endpoint hit.");
        try {
            const { page, limit, sort, search } = req.query;

            const query: any = {
                page: Number(page) > 0 ? Number(page) : 1, // Ensure page is a positive number, default to 1
                limit: Number(limit) > 0 ? Number(limit) : 10, // Ensure limit is a positive number, default to 10
                sort: sort && (Number(sort) === 1 || Number(sort) === -1) ? (Number(sort) as 1 | -1) : -1, // Ensure only 1 or -1
                search: search ? String(search) : '' // Ensure search is always a string
            };

            const wallet = await this.referralServices.getAllReferralHistory(query);
            logger.info("wallet retrieved successfully.");
            return sendSuccessResponse(res, "referral history retrieved successfully.", wallet);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    getReferralHistory = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        logger.info("Get all wallet endpoint hit." + userId);
        try {
            const wallet = await this.referralServices.getReferralHistory(userId);
            logger.info("wallet retrieved successfully.");
            return sendSuccessResponse(res, "referral history retrieved successfully.", wallet);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
}

export default new referralCollection();