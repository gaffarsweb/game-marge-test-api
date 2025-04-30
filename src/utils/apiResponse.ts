import { Response } from "express";
import { HTTP_STATUS, HTTP_MESSAGE } from "./httpStatus";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: {
    code: number;
    description: string;
    details?: any;
  };
}

/**
 * Sends a success response.
 */
export const sendSuccessResponse = (
  res: Response,
  message: string = HTTP_MESSAGE.OK,
  data: any = null,
  statusCode: number = HTTP_STATUS.OK
) => {
  const response: ApiResponse = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Sends an error response.
 */
export const sendErrorResponse = (
  res: Response,
  details: any = null,
  message: string = HTTP_MESSAGE.INTERNAL_SERVER_ERROR,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
) => {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: statusCode,
      description: message,
      details,
    },
  };
  return res.status(statusCode).json(response);
};
