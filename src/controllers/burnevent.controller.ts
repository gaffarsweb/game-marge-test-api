import {Request, Response} from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { BurnEventService } from '../services/burnevent.service';
import { logger } from '../utils/logger';
import { CustomRequest } from '../interfaces/auth.interface';


class BurnEventController {

    constructor(private burnEventService:BurnEventService=new BurnEventService()) {}

 getBurnEvent=async(req:Request,res:Response):Promise<any>=>{
    try{
        const burnevent=await this.burnEventService.getBurnEvents();
        return sendSuccessResponse(res,"Burning event fetched successfully",burnevent);
    }catch(error:any){
        logger.error("Error fetching burning event:", error.message);
        return sendErrorResponse(res,error,error.message);
    }
 }
 getBurnEventById=async(req:Request, res:Response):Promise<any>=>{
    try{
        const burnevent=await this.burnEventService.getBurnEventById(req.params.id);
        return sendSuccessResponse(res, "Burning event fetched successfully", burnevent);
    }catch(error:any){
        logger.error("Error fetching burning event:", error.message);
        return sendErrorResponse(res, error, error.message);
    }
 }

 createBurnEvent=async(req:CustomRequest, res:Response):Promise<any>=>{
    const userId=req.user?.id;
    try{
        const burnevent=await this.burnEventService.createBurnEvent({...req.body,userId});
        return sendSuccessResponse(res, "Burning event created successfully", burnevent);
    }catch(error:any){
        logger.error("Error creating burning event:", error.message);
        return sendErrorResponse(res, error, error.message);
    }
 }


 updateBurnEvent=async(req:Request, res:Response):Promise<any>=>{
    try{
        const burnevent=await this.burnEventService.updateBurnEvent(req.params.id, req.body);
        return sendSuccessResponse(res, "Burning event updated successfully", burnevent);
    }catch(error:any){
        logger.error("Error updating burning event:", error.message);
        return sendErrorResponse(res, error, error.message);
    }
 }
    deleteBurnEvent=async(req:Request, res:Response):Promise<any>=>{
        try{
            const burnevent=await this.burnEventService.deleteBurnEvent(req.params.id);
            return sendSuccessResponse(res, "Burning event deleted successfully", burnevent);
        }catch(error:any){
            logger.error("Error deleting burning event:", error.message);
            return sendErrorResponse(res, error, error.message);
        }
    }
    triggerBurnEvent=async(req:CustomRequest, res:Response):Promise<any>=>{
        const userId=(req.user?.id as any) as string;
        const eventId=req.params.id;
        if(!userId || !eventId){
            return sendErrorResponse(res, "User ID or Event ID is missing");
        }
        try{
            await this.burnEventService.triggerBurnEvent(userId,eventId);
            return sendSuccessResponse(res, "Burning event triggered successfully", {});
        }catch(error:any){
            logger.error("Error triggering burning event:", error.message);
            return sendErrorResponse(res, error, error.message);
        }
    }
    getBurnCoinHistory=async(req:Request, res:Response):Promise<any>=>{
        try{
            const burnCoinHistory=await this.burnEventService.getBurnCoinHistory();
            return sendSuccessResponse(res, "Burning coin history fetched successfully", burnCoinHistory);
        }catch(error:any){
            logger.error("Error fetching burning coin history:", error.message);
            return sendErrorResponse(res, error, error.message);
        }
    }
}

export default new BurnEventController();