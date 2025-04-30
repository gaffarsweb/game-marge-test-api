import {Request,Response} from 'express';
import { BotService } from "../services/bot.service";
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';
import { HTTP_MESSAGE, HTTP_STATUS } from '../utils/httpStatus';
import {Schema} from  'mongoose';
import { IUpdateBot } from '../interfaces/bot.interface';
import { CustomError } from '../utils/custom-error';
import { logger } from '../utils/logger';

class BotController{
    constructor(private botService: BotService=new BotService()){}

    createBot=async(req:Request,res:Response):Promise<any>=>{
      logger.info("Create bot endpoint hit.");
        try{
           const newBot= await this.botService.createNewBot(req.body)
            logger.info("Bot created successfully.");
            return sendSuccessResponse(res,HTTP_MESSAGE.CREATED,newBot,HTTP_STATUS.CREATED);
        }catch(error:any){
         logger.error("Error while creating new bot",error);
         if(error instanceof CustomError){
           return sendErrorResponse(res,error,error.message,error.statusCode);
         }
           return sendErrorResponse(res,error,error.message || "Error creating new bot");
        }
    }
    getAllBots = async (req: Request, res: Response): Promise<any> => {
      logger.info("Get all bots endpoint hit.");
      try {
          const bots = await this.botService.getAllBots(req.query);
          logger.info("Bots retrieved successfully.");
          return sendSuccessResponse(res, "Ok", bots);
      } catch (error: any) {
          logger.error("Error while getting bots", error);
          if (error instanceof CustomError) {
              return sendErrorResponse(res, error, error.message, error.statusCode);
          }
          return sendErrorResponse(res, error, error.message || "Error getting bots");
      }
  };
  

    deleteBot=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Delete bot endpoint hit.");
        const botId=(req.params.botId as any)as Schema.Types.ObjectId;
     try{
       const deletedBot= await this.botService.removeBot(botId);
       logger.info("Bot deleted successfully, botId: " + deletedBot?._id);
        return sendSuccessResponse(res);
     }catch(error:any){
        return sendErrorResponse(res,error.message);
     }
    }
    updateBot=async(req:Request,res:Response):Promise<any>=>{
      logger.info("Update bot endpoint hit.");
       const botId=(req.params.botId as any)as Schema.Types.ObjectId;
       const payload=req.body as IUpdateBot;
       console.log("Paylod:",payload);
       try{
         const updatedBot=await this.botService.updateBot(botId,payload);
         logger.info("Bot updated successfully, botId: " + updatedBot?._id);
         return sendSuccessResponse(res,"Bot updated successfully.",updatedBot);
       }catch(error:any){
         return sendErrorResponse(res,error);
       }
    }
    getBotById=async(req:Request,res:Response):Promise<any>=>{
      logger.info("Get bot by id endpoint hit.");
      const botId=(req.params.botId as any)as Schema.Types.ObjectId;
      try{
         const bot=await this.botService.getBotById(botId);
         logger.info("Bot retrieved successfully, botId: " + bot?._id);
         return sendSuccessResponse(res,"Ok",bot);
      }catch(error:any){
        logger.error("Error while getting bot",error);
        if(error instanceof CustomError){
          return sendErrorResponse(res,error,error.message,error.statusCode);
        }
        return sendErrorResponse(res,error,error.message || "Error finding bot");
      }
    }
}

export default new BotController();