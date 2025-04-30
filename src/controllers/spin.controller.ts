import {Request,Response} from 'express';
import { logger } from '../utils/logger';
import { SpinService } from '../services/spin.service';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { CustomRequest } from '../interfaces/auth.interface';
import { Schema } from 'mongoose';


class SpinController{

    constructor(private spinService:SpinService=new SpinService()){};

    spin = async (req: CustomRequest, res: Response):Promise<any> => {
        logger.info("Spin endpoint hit.");
        const userId=req.user?.id!
        try {
           const result= await this.spinService.spin(userId,req.body.spinFee);
            return sendSuccessResponse(res,"coins deducted succesfully.",{remainingSpins:result});
        } catch (error:any) {
            return sendErrorResponse(res,error,error.message)
        }
    }
    
    rewardsUser = async (req: CustomRequest, res: Response):Promise<any> => {
        logger.info("Reward user endpoint hit.");
        const userId=req.user?.id!;
        try {
            const result=await this.spinService.rewardUser(userId, req.body.combination,req.body.spinFee);
            return sendSuccessResponse(res,"User has been rewarded successfully.",result)
        } catch (error:any) {
           return sendErrorResponse(res, error, error.message);
        }
    }
    createSpinCombinations = async (req: Request, res: Response):Promise<any> => {
        logger.info("Create spin combinations endpoint hit.");
        try {
            const combinations = await this.spinService.createSpinCombinations(req.body.combinations);
            return sendSuccessResponse(res, "Spin combinations created successfully.", combinations);
        } catch (error:any) {
            return sendErrorResponse(res, error, error.message || "Error creating spin combinations");
        }
    }
    updateSpinCombinations = async (req: Request, res: Response):Promise<any> => {
        logger.info("Update spin combinations endpoint hit.");
        const combinationId=(req.params.combinationId as any) as Schema.Types.ObjectId
        try {
            const updatedCombination = await this.spinService.updateSpinCombination(combinationId, req.body);
            return sendSuccessResponse(res, "Spin combination updated successfully.", updatedCombination);
        } catch (error:any) {
            return sendErrorResponse(res, error, error.message || "Error updating spin combination");
        }
    }
    getSpinCombinations = async (req: Request, res: Response):Promise<any> => {
        logger.info("Get spin combinations endpoint hit.");
        try {
            const combinations = await this.spinService.getSpinCombinations();
            return sendSuccessResponse(res, "Spin combinations retrieved successfully.", combinations);
        } catch (error:any) {
            return sendErrorResponse(res, error, error.message || "Error retrieving spin combinations");
        }
    }
    getSpinCombination = async (req: Request, res: Response):Promise<any> => {
        logger.info("Get spin combination by id endpoint hit.");
        const combinationId=(req.params.combinationId as any) as Schema.Types.ObjectId
        try {
            const combination = await this.spinService.getSpinCombination(combinationId);
            return sendSuccessResponse(res, "Spin combination retrieved successfully.", combination);
        } catch (error:any) {
            return sendErrorResponse(res, error, error.message || "Error retrieving spin combination");
        }
    }
    deleteSpinCombinations = async (req: Request, res: Response):Promise<any> => {
        logger.info("Delete spin combinations endpoint hit.");
        try {
            const combinationId=(req.params.combinationId as any) as Schema.Types.ObjectId
           const deletedCombination= await this.spinService.deleteSpinCombination(combinationId);
            return sendSuccessResponse(res, "Spin combination deleted successfully.",deletedCombination);
        } catch (error:any) {
            return sendErrorResponse(res, error, error.message || "Error deleting spin combination");
        }
    }
    getSpinHistory = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get spin history endpoint hit.");
        try {
            const { page, limit, sort, search, filter } = req.query as { page?:string, limit?:string, sort?: string, search?: string, filter?: string };
    
            const result = await this.spinService.getSpinHistory({page, limit, sort, search, filter});
            if (!result.status) {
                return sendErrorResponse(res, null, result.msg, result.code);
            }
            return sendSuccessResponse(res, "Data Fetched Successfully", result.data, result.code);
        } catch (error) {
            logger.error("Error fetching spin history", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    getSpinFee = async (req: CustomRequest, res: Response):Promise<any> => {
        logger.info("Get spin fee endpoint hit.");
        const userId=req.user?.id!;
        try {
            const spinFee = await this.spinService.getSpinFee(userId);
            return sendSuccessResponse(res, "Spin fee retrieved successfully.", spinFee);
        } catch (error:any) {
            return sendErrorResponse(res, error, error.message || "Error retrieving spin fee");
        }
    }
    
}

export default new SpinController();