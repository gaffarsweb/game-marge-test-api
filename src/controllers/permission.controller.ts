import { Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import * as permissionSer from "../services/permission.service"




export const addUpdatePermission = async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.body?.userId) return sendErrorResponse(res, null, 'invalid data', 400);
        if (!req.body?.permissions) return sendErrorResponse(res, null, 'invalid data', 400);

        const result = await permissionSer.addUpdatePermission(req.body);
        if (result.status) {
            return sendSuccessResponse(res, result?.msg, result?.data)
        } else {
            return sendErrorResponse(res, result?.data, result?.msg, result.code)
        }
    } catch (error: any) {
        return sendErrorResponse(res, null, error.message, 500)
    }
};

export const getPermissions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.params;

        if (!userId) return sendErrorResponse(res, null, 'invalid data', 400);

        const result = await permissionSer.getPermissions(userId);
        if (result.status) {
            return sendSuccessResponse(res, result.msg, result.data)
        } else {
            return sendErrorResponse(res, result.data, result.msg, result.code)
        }
    } catch (error: any) {
        return sendErrorResponse(res, null, error.message, 500)
    }
}