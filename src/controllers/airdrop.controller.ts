import { Request,Response } from "express";
import { AirdropService } from "../services/airdrop.service";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";
import { CustomError } from "../utils/custom-error";
import { CustomRequest } from "../interfaces/auth.interface";

class AirdropCampaignController{
    constructor (private airdropService:AirdropService=new AirdropService()) {}
    createAirdrop = async (req: Request, res: Response):Promise<any> => {
        logger.info("Create Airdrop endpoint hit.");
        try{
            const airdrop = await this.airdropService.createAirdrop(req.body);
            return sendSuccessResponse(res, "Airdrop created successfully.", airdrop);

        }catch(error:any){
            logger.error("Error creating airdrop: ", error.message);
            return sendErrorResponse(res, "Error creating airdrop", error.message);
        }
      };
      
    getAllAirdrops = async (req: Request, res: Response):Promise<any> => {
        logger.info("Get all Airdrops endpoint hit.");
        try{
            const airdrops = await this.airdropService.getAllAirdrops(req.query);
            return sendSuccessResponse(res, "Airdrops fetched successfully.", airdrops);
        }catch(error:any){
            logger.error("Error fetching airdrops: ", error.message);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching airdrops", error.message);
        }
    }

    updateAirdrop = async (req: Request, res: Response):Promise<any> => {
        logger.info("Update Airdrop endpoint hit.");
        try{
            const airdrop = await this.airdropService.updateAirdrop(req.params.id, req.body);
            return sendSuccessResponse(res, "Airdrop updated successfully.", airdrop);
        }catch(error:any){
            logger.error("Error updating airdrop: ", error.message);
            return sendErrorResponse(res, "Error updating airdrop", error.message);
        }
    }

    deleteAirdrop = async (req: Request, res: Response):Promise<any> => {
        logger.info("Delete Airdrop endpoint hit.");
        try{
            const airdrop = await this.airdropService.deleteAirdropById(req.params.id);
            return sendSuccessResponse(res, "Airdrop deleted successfully.", airdrop);
        }catch(error:any){
            logger.error("Error deleting airdrop: ", error.message);
            return sendErrorResponse(res, "Error deleting airdrop", error.message);
        }
    }

    getActiveAirdrops = async (req: Request, res: Response):Promise<any> => {
        logger.info("Get active Airdrops endpoint hit.");
        try{
            const airdrops = await this.airdropService.getActiveAirdrops();
            return sendSuccessResponse(res, "Active airdrops fetched successfully.", airdrops);
        }catch(error:any){
            logger.error("Error fetching active airdrops: ", error.message);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching active airdrops", error.message);
        }
    }

    getAirdropById = async (req: CustomRequest, res: Response):Promise<any> => {
        logger.info("Get Airdrop by ID endpoint hit.");
        const userId = req.user?.id!;
        try{
            const airdrop = await this.airdropService.getAirdropById(userId,req.params.id);
            return sendSuccessResponse(res, "Airdrop fetched successfully.", airdrop);
        }catch(error:any){
            logger.error("Error fetching airdrop: ", error.message);
            return sendErrorResponse(res, "Error fetching airdrop", error.message);
        }
    }

    claimTaskReward = async (req: CustomRequest, res: Response):Promise<any> => {
        logger.info("Claim Task Reward endpoint hit.");
        try{
            const payload={
                userId:(req.user?.id as any) as string,
                campaignId:req.params.campaignId as string,
                taskIndex:Number(req.params.index)
            }
            const reward = await this.airdropService.claimTaskReward(payload.userId, payload.campaignId, payload.taskIndex);
            return sendSuccessResponse(res, "Task reward claimed successfully.", reward);
        }catch(error:any){
            logger.error("Error claiming task reward: ", error.message);
            return sendErrorResponse(res, "Error claiming task reward", error.message);
        }
    }

    getUserCompletedTasks = async (req: CustomRequest, res: Response):Promise<any> => {
        logger.info("Get User Completed Tasks endpoint hit.");
        try{
            const payload={
                userId:(req.user?.id as any) as string,
                campaignId:req.params.campaignId as string
            }
            const tasks = await this.airdropService.getUserCompletedTasks(payload.userId, payload.campaignId);
            return sendSuccessResponse(res, "User completed tasks fetched successfully.", tasks);
        }catch(error:any){
            logger.error("Error fetching user completed tasks: ", error.message);
            return sendErrorResponse(res, "Error fetching user completed tasks", error.message);
        }
    }

    getAirdropWithoutPage = async (req: Request, res: Response):Promise<any> => {
        logger.info("Get all Airdrops endpoint hit.");
        try{
            const airdrops = await this.airdropService.getAirdropWithoutPage();
            return sendSuccessResponse(res, "Airdrops fetched successfully.", airdrops);
        }catch(error:any){
            logger.error("Error fetching airdrops: ", error.message);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching airdrops", error.message);
        }
    }
}

export default new AirdropCampaignController();