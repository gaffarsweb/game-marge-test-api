import { CustomRequest } from "../interfaces/auth.interface";
import { logger } from "../utils/logger";
import { Response, NextFunction } from "express";
import utility from "../utils/utility";
import { sendErrorResponse } from "../utils/apiResponse";
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";
import securityModel from "../models/security.model";

export const authenticateRequest = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token =
      req.headers["authorization"]?.split(" ")[1] || req.cookies?.accessToken;

    const ip = req.ip || req.connection.remoteAddress;
    console.log('ip', ip);

    if (!token) {
      logger.warn(`Unauthorized access attempt from IP: ${req.ip}`);
      return sendErrorResponse(
        res,
        "No token provided",
        HTTP_MESSAGE.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const decoded = await utility.verifyJwtToken(token);
    if (!decoded) {
      logger.warn(`Invalid Token Used from IP: ${req.ip}`);
      return sendErrorResponse(
        res,
        "Invalid Token",
        HTTP_MESSAGE.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (['admin', 'superAdmin'].includes(decoded?.role)) {
      let ip: string = req.ip || req.connection.remoteAddress || "";

      // Normalize IPv6 localhost and IPv4-mapped IPv6 addresses
      if (ip === "::1" || ip === "::ffff:127.0.0.1") {
        ip = "127.0.0.1";
      } else if (ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
      };

      const security = await securityModel.findOne({});
      const whitelist = security?.whitelistIp || [];

      if (!whitelist.includes(ip)) {
        logger.warn(`Unauthorized IP attempt: ${ip}`);
        return sendErrorResponse(
          res,
          "Access denied",
          HTTP_MESSAGE.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    const isJwtError =
      error.name === "TokenExpiredError" || error.name === "JsonWebTokenError";

    logger.error(
      `Authentication error: ${error.message || "Unknown error"} - IP: ${req.ip}`
    );

    return sendErrorResponse(
      res,
      error.message,
      HTTP_MESSAGE.UNAUTHORIZED,
      isJwtError ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
