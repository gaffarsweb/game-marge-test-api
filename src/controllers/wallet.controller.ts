import { Request, Response } from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { WalletService } from "../services/wallet.service";
import { CustomError } from "../utils/custom-error";
import { logger } from '../utils/logger';
import { Schema } from 'mongoose';
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";
import userModel from "../models/user.model";
import Settings from "../models/setting.model";

class walletController {

    constructor(private walletService: WalletService = new WalletService()) { }


    checkDeposit = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id;
        const { networkName , currency} = req?.body;
        try {
            const wallet = await this.walletService.checkDeposit(userId, networkName, currency);
            return sendSuccessResponse(res, "wallet retrieved successfully.", wallet);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    getInGameWallet = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        try {
            const wallet = await this.walletService.getInGameWallet(userId);
            return sendSuccessResponse(res, "wallet retrieved successfully.", wallet);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    fetchWalletBalances = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        try {
            const wallet = await this.walletService.fetchWalletBalances(userId);
            if (wallet?.code === 404) {
                return sendErrorResponse(res, wallet, wallet.msg, HTTP_STATUS.NOT_FOUND)
            } else if (wallet?.code === 200) {

                return sendSuccessResponse(res, "wallet retrieved successfully.", wallet);
            }
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    fetchNetworks = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        try {
            const wallet = await this.walletService.fetchNetworks(userId);
            if (wallet?.code === 404) {
                return sendErrorResponse(req, wallet, wallet.msg, HTTP_STATUS.NOT_FOUND)
            } else if (wallet?.code === 200) {
                return sendSuccessResponse(res, "wallet retrieved successfully.", wallet);

            }
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    fetchNetworksCoins = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        try {
            const wallet = await this.walletService.fetchNetworksCoins(userId);
            if (wallet?.code === 404) {
                return sendErrorResponse(req, wallet, wallet.msg, HTTP_STATUS.NOT_FOUND)
            } else if (wallet?.code === 200) {
                return sendSuccessResponse(res, "coins retrieved successfully.", wallet);

            }
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    fetchNetworksByCoins = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        const token = req?.params.coin
        try {
            const wallet = await this.walletService.fetchNetworksByCoins(userId, token);
            if (wallet?.code === 404) {
                return sendErrorResponse(req, wallet, wallet.msg, HTTP_STATUS.NOT_FOUND)
            } else if (wallet?.code === 200) {
                return sendSuccessResponse(res, "coins retrieved successfully.", wallet);

            }
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    fetchTokenByNetwork = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        const network = req?.params.network
        try {
            const wallet = await this.walletService.fetchTokenByNetwork(userId, network);
            if (wallet?.code === 404) {
                return sendErrorResponse(req, wallet, wallet.msg, HTTP_STATUS.NOT_FOUND)
            } else if (wallet?.code === 200) {
                return sendSuccessResponse(res, "coins retrieved successfully.", wallet);

            }
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }

    fetchWalletBalanceById = async (req: any, res: Response): Promise<any> => {
        const userId = req?.params?.id
        try {
            const wallet = await this.walletService.fetchWalletBalanceById(userId);
            if (wallet?.code === 404) {
                return sendErrorResponse(req, wallet, wallet.msg, HTTP_STATUS.NOT_FOUND)
            } else if (wallet?.code === 200) {
                return sendSuccessResponse(res, "coins retrieved successfully.", wallet);

            }
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    updateWalletBalance = async (req: any, res: Response): Promise<any> => {
        try {
            const wallet = await this.walletService.updateWalletBalance();
            if (wallet?.code === 404) {
                return sendErrorResponse(req, wallet, wallet.msg, HTTP_STATUS.NOT_FOUND)
            } else if (wallet?.code === 200) {
                return sendSuccessResponse(res, "Users wallet updated successfully.", wallet);

            }
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
}

export default new walletController();