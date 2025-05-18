import { Request, Response } from 'express';
import * as depositService from '../services/deposit.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';


export const getAllDeposits = async (req: Request, res: Response): Promise<any> => {
  logger.info("Get all deposits endpoint hit.");

  try {
    const { page, limit, sort, search, filter } = req.query as {
      page?: string;
      limit?: string;
      sort?: string;
      search?: string;
      filter?: string;
    };

    const isExport = (req.query.isExport as string) === "true";

    if (isExport) {
      const result = await depositService.getAllDeposits({ page, limit, sort, search, filter, isExport }, res);
      return
    } else {
      const result = await depositService.getAllDeposits({ page, limit, sort, search, filter }, res);

      if (!result.status) {
        return sendErrorResponse(res, null, result.msg, result.code);
      }

      return sendSuccessResponse(res, "Deposits fetched successfully", result.data, result.code);
    }


  } catch (error) {
    logger.error("Error fetching deposits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};