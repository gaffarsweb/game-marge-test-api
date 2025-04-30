import { Request,Response } from "express";
import { sendSuccessResponse,sendErrorResponse } from "../utils/apiResponse";
import { SubGameService } from "../services/subgame.service";
import { CustomError } from "../utils/custom-error";
import {logger} from '../utils/logger';
import { ISubGame } from "../models/subgame.model";
import {Schema} from 'mongoose';
import { IUpdateSubGame } from "../interfaces/subgame.interface";
import { HTTP_STATUS } from "../utils/httpStatus";

class SubGameController{

    constructor(private subGameService: SubGameService=new SubGameService()){}

    createNewSubgame=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Create new sub game endpoint hit.");
        const payload=req.body as ISubGame
        try{
            const newSubGame=await this.subGameService.create(payload);
            logger.info("Sub game created successfully.")
            return sendSuccessResponse(res,"Sub game created successfully",newSubGame);
        }catch(error:any){
            logger.error("Failed to create new subgame", error);
            if(error.code===11000) return sendErrorResponse(res, error.message,"Subgame already exists", HTTP_STATUS.BAD_REQUEST)
            if(error instanceof CustomError){
                return sendErrorResponse(res,error,error.message,error.statusCode)
            }
            return sendErrorResponse(res, error.message, error.statusCode);
        }
    }

    getAllSubgamesByGameId=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Get all subgames endpoint hit.");
        const {gameId}=(req.params as any) 
        try{
            const subgames=await this.subGameService.getAllSubGames(gameId,req.query);
            logger.info("Subgames retrieved successfully.");
            return sendSuccessResponse(res,"subgames retrieved successfully.",subgames);
        }catch(error:any){
            logger.error(`Failed to retrieve subgames, error:${error}`);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error,error.message,error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    getAllSubgamesForApp=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Get all subgames for app endpoint hit."); 
        try{
            const subgames=await this.subGameService.getAllSubGamesForApp(req.query);
            logger.info("Subgames retrieved successfully.");
            return sendSuccessResponse(res,"subgames retrieved successfully.",subgames);
        }catch(error:any){
            logger.error(`Failed to retrieve subgames, error:${error}`);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error,error.message,error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    getSubgame=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Get subgame endpoint hit.");
        const {subgameId}=(req.params as any) as {subgameId:Schema.Types.ObjectId}
        try{
            const subgame=await this.subGameService.getSubGame(subgameId);
            logger.info("Subgame retrieved successfully.");
            return sendSuccessResponse(res,"subgame retrieved successfully.",subgame);
        }catch(error:any){
            logger.error(`Failed to retrieve subgame, error:${error}`);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error,error.message,error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    updateSubgame=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Update subgame endpoint hit.");
        const {subgameId}=(req.params as any) as {subgameId:Schema.Types.ObjectId};
        const payload=req.body as IUpdateSubGame;
        try{
            const subgame=await this.subGameService.update(subgameId,payload);
            logger.info("Subgame updated successfully.");
            return sendSuccessResponse(res,"subgame updated successfully.",subgame);
        }catch(error:any){
            logger.error(`Failed to delete subgame, error:${error}`);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error,error.message,error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
    deleteSubgame=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Delete subgame endpoint hit.");
        const {subgameId}=(req.params as any) as {subgameId:Schema.Types.ObjectId}
        try{
            const subgame=await this.subGameService.delete(subgameId);
            logger.info("Subgame deleted successfully.");
            return sendSuccessResponse(res,"subgame deleted successfully.",subgame);
        }catch(error:any){
            logger.error(`Failed to delete subgame, error:${error}`);
            if(error instanceof CustomError){
                return sendErrorResponse(res,error,error.message,error.statusCode)
            }
            sendErrorResponse(res, error.message, error.statusCode);
        }
    }
}

export default new SubGameController();