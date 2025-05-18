import { Request, Response } from 'express';
import * as depositService from '../services/security.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';


export const AddSecurityIp = async (req: Request, res: Response): Promise<any> => {
  logger.info("Get all deposits endpoint hit.");

  try {
    const result = await depositService.AddSecurityIp(req.body);

    if (!result.status) {
      return sendErrorResponse(res, null, result.msg, result.code);
    }

    return sendSuccessResponse(res, result.msg, result.data, result.code);
  } catch (error) {
    logger.error("Error fetching deposits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getWhitelistIp = async (req: Request, res: Response): Promise<any> => {
  logger.info("Get all deposits endpoint hit.");

  try {
    const result = await depositService.getWhitelistIp();

    if (!result.status) {
      return sendErrorResponse(res, null, result.msg, result.code);
    }

    return sendSuccessResponse(res, result.msg, result.data, result.code);
  } catch (error) {
    logger.error("Error fetching deposits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const checkWhiteListIp = async (req: Request, res: Response): Promise<any> => {
  logger.info("Get all deposits endpoint hit.");

  try {
    let ip:any = req.ip || req.connection.remoteAddress;
  
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    } else {
      ip = ip.replace('::ffff:', ''); // correctly strip IPv6-mapped IPv4
    }
    console.log('checking ip ', ip)
    if (!ip) {
      return sendErrorResponse(res, null, 'you dont have access', 400)
    }
    const result = await depositService.checkWhiteListIp(ip);

    if (!result.status) {
      return sendErrorResponse(res, null, result.msg, result.code);
    }

    return sendSuccessResponse(res, result.msg, result.data, result.code);
  } catch (error) {
    logger.error("Error fetching deposits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};