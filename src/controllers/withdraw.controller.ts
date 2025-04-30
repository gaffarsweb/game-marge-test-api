import { Request, Response } from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { WithdrawServices } from "../services/withdraw.service";
import { CustomError } from "../utils/custom-error";
import { logger } from '../utils/logger';

class withdrawController {

    constructor(private withdrawServices: WithdrawServices = new WithdrawServices()) { }


    approveRequest = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        logger.info("Get all wallet endpoint hit." + userId);
        const { requestId } = req?.body
        try {
            const result = await this.withdrawServices.approveRequest(userId, requestId);
            logger.info("result retrieved successfully.");
            if (result?.code === 404) {
                return sendErrorResponse(res, result, result.msg, result.code)
            } else if (result?.code === 400) {
                return sendErrorResponse(res, result, result.msg, result.code)
            }
            return sendSuccessResponse(res, "request approved successfully.", result);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    rejectRequest = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id; // Get the ID of the admin performing the action
        logger.info("Reject request endpoint hit. Admin ID: " + userId);
      
        const { requestId } = req.body; // Get the ID of the withdrawal request to reject
      
        try {
          const result = await this.withdrawServices.rejectRequest(userId, requestId); // Call the service layer to process rejection
      
          logger.info("Withdrawal request rejected successfully.");
      
          // Handle possible error responses
          if (result?.code === 404) {
            return sendErrorResponse(res, result, result.msg, result.code);
          } else if (result?.code === 400) {
            return sendErrorResponse(res, result, result.msg, result.code);
          }
      
          // If success
          return sendSuccessResponse(res, "Request rejected successfully.", result);
        } catch (error: any) {
          logger.error(`Failed to reject withdrawal request. Error: ${error}`);
      
          if (error instanceof CustomError) {
            return sendErrorResponse(res, error, error.message, error.statusCode);
          }
      
          return sendErrorResponse(res, error.message, error.statusCode);
        }
      };
      
    sendWithdrawRequest = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        logger.info("Get all wallet endpoint hit." + userId);
        const { withdrawAmount, withdrawToAddress, currency, selectedNetwork, ...body } = req?.body
        try {
            const result = await this.withdrawServices.sendWithdrawRequest(userId, withdrawAmount, withdrawToAddress, currency, selectedNetwork);
            logger.info("result retrieved successfully.");
            if (result?.code === 404) {
                return sendErrorResponse(res, result, result.msg, result.code)
            } else if (result?.code === 400) {
                return sendErrorResponse(res, result, result.msg, result.code)
            }
            return sendSuccessResponse(res, "result retrieved successfully.", result);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    verifyWithdrawRequest = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        logger.info("Get all wallet endpoint hit." + userId);
        const { requestId, OTP, ...body } = req?.body
        try {
            const result = await this.withdrawServices.verifyWithdrawRequest(userId, requestId, OTP);
            logger.info("result retrieved successfully.");
            if (result?.code === 404) {
                return sendErrorResponse(res, result, result.msg, result.code)
            } else if (result?.code === 400) {
                return sendErrorResponse(res, result, result.msg, result.code)
            }
            return sendSuccessResponse(res, "result retrieved successfully.", result);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    resentWithdrawRequestVerification = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        logger.info("Get all wallet endpoint hit." + userId);
        const { requestId,  ...body } = req?.body
        try {
            const result = await this.withdrawServices.resentWithdrawRequestVerification(userId, requestId);
            logger.info("result retrieved successfully.");
            if (result?.code === 404) {
                return sendErrorResponse(res, result, result.msg, result.code)
            } else if (result?.code === 400) {
                return sendErrorResponse(res, result, result.msg, result.code)
            }
            return sendSuccessResponse(res, "result retrieved successfully.", result);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    allWithdrawalRequests = async (req: any, res: Response): Promise<any> => {
        const userId = req?.user?.id
        logger.info("Get all wallet endpoint hit." + userId);
        try {
            const result = await this.withdrawServices.allWithdrawalRequests(userId, req.query);
            logger.info("result retrieved successfully.");
            if (result?.code === 404) {
                return sendErrorResponse(res, result, result.msg, result.code)
            } else if (result?.code === 400) {
                return sendErrorResponse(res, result, result.msg, result.code)
            }
            return sendSuccessResponse(res, "result retrieved successfully.", result);
        } catch (error: any) {
            logger.error(`Failed to retrieve wallet, error:${error}`);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
}

export default new withdrawController();