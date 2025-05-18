import { Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import * as networksSer from "../services/networks.service"




export const createNetwork = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await networksSer.createNetwork(req.body);
        if (result.status) {
            return sendSuccessResponse(res, result?.msg, result?.data)
        } else {
            return sendErrorResponse(res, result?.data, result?.msg, result.code)
        }
    } catch (error: any) {
        return sendErrorResponse(res, null, error.message, 500)
    }
};
export const updateNetworks = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await networksSer.updateNetworks(req.body);
        if (result.status) {
            return sendSuccessResponse(res, result?.msg, result?.data)
        } else {
            return sendErrorResponse(res, result?.data, result?.msg, result.code)
        }
    } catch (error: any) {
        return sendErrorResponse(res, null, error.message, 500)
    }
};

export const getNetworks = async (req: Request, res: Response): Promise<any> => {
    try {

        const result = await networksSer.getNetworks();
        if (result.status) {
            return sendSuccessResponse(res, result.msg, result.data)
        } else {
            return sendErrorResponse(res, result.data, result.msg, result.code)
        }
    } catch (error: any) {
        return sendErrorResponse(res, null, error.message, 500)
    }
}