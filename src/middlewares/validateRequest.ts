import { validationResult, matchedData } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { sendErrorResponse } from "../utils/apiResponse";
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("Request validation failed", { errors: errors.array() });
    const errorMessages = errors.array().map((error) => error.msg);
    return sendErrorResponse(
      res,
      errorMessages[0],
      HTTP_MESSAGE.BAD_REQUEST,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Attaching sanitized data from all request sources
  req.body = matchedData(req, { locations: ["body"] });
  req.params = matchedData(req, { locations: ["params"] });
  req.query = matchedData(req, { locations: ["query"] });
  req.headers = matchedData(req, { locations: ["headers"] });

  next();
};
