import { Request, Response } from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { TransatctionsServices } from "../services/transactions.service";
import { CustomError } from "../utils/custom-error";
import { logger } from '../utils/logger';
import { Schema } from 'mongoose';
import { Result } from "ethers";

class practiceGameController {

    constructor(private transatctionsServices: TransatctionsServices = new TransatctionsServices()) { }

    getAllInGameCoinTransactions = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        try {
            const transactions = await this.transatctionsServices.getAllInGameCoinTransactions(userId);
            logger.info("transactions retrieved successfully.");
            return sendSuccessResponse(res, "transactions retrieved successfully.", transactions);
        } catch (error: any) {
            logger.error(`Failed to retrieve transactions, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }

    getCoinsTransactions = async (req: any, res: Response): Promise<any> => {
        try {
            const { page, limit, sort, search, filter } = req.query as { page?:string, limit?:string, sort?: string, search?: string, filter?: string };
            const transactions = await this.transatctionsServices.getCoinsTransactions({ page, limit, sort, search, filter });
            if(!transactions.status){
                return sendErrorResponse(res, null, transactions.msg, transactions.code)
            }
            return sendSuccessResponse(res, "transactions retrieved successfully.", transactions.data, transactions.code);
        } catch (error: any) {
            logger.error(`Failed to retrieve transactions, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    getAllTransations = async (req: any, res: Response): Promise<any> => {
        try {
            const userId = req?.user?.id;
            const { page, limit, sort, search, filter } = req.query as { page?:string, limit?:string, sort?: string, search?: string, filter?: string };
            const transactions = await this.transatctionsServices.getAllTransations({ page, limit, sort, search, filter,userId });
            if(!transactions.status){
                return sendErrorResponse(res, null, transactions.msg, transactions.code)
            }
            return sendSuccessResponse(res, "transactions retrieved successfully.", transactions.data, transactions.code);
        } catch (error: any) {
            logger.error(`Failed to retrieve transactions, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
   
}

export default new practiceGameController();