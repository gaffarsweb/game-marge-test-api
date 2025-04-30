import { Schema } from "mongoose";
import { TournamentParticipationService } from "../services/tournamentParticipation.service";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";
import {Request,Response} from 'express';

class TournamentParticipationController{
    constructor(private tournamentParticipationService:TournamentParticipationService=new TournamentParticipationService()){}

    joinTournament=async(req:Request,res:Response):Promise<any>=>{
        logger.info("Join Tournament endpoint hit.")
        try{
            const {userId,tournamentId}=req.body;
            const participation=await this.tournamentParticipationService.joinTournament(userId,tournamentId);
            logger.info("Tournament joined successfully.")
            return sendSuccessResponse(res, "Tournament joined successfully.", participation);
        }catch(error:any){
            logger.error("Error in Join Tournament endpoint.")
            return sendErrorResponse(res,error.message,"Error while join tournament");
        }
    }
    getParticipationByTournamentId=async(req:Request, res:Response):Promise<any>=>{
        logger.info("Get Participation By Tournament Id endpoint hit.")
        try{
            const tournamentId=req.params.tournamentId as unknown as Schema.Types.ObjectId;
            const participation=await this.tournamentParticipationService.getParticipationByTournamentId(tournamentId);
            logger.info("Participation fetched successfully.")
            return sendSuccessResponse(res, "Participation fetched successfully.", participation);
        }catch(error:any){
            logger.error("Error in Get Participation By Tournament Id endpoint.")
            return sendErrorResponse(res, error.message, "Error while fetching participation");
        }
    }
    getParticipationByUserId=async(req:Request, res:Response):Promise<any>=>{
        logger.info("Get Participation By User Id endpoint hit.")
        try{
            const userId=req.params as unknown as Schema.Types.ObjectId ;
            const participation=await this.tournamentParticipationService.getParticipationByUserId(userId);
            logger.info("Participation fetched successfully.")
            return sendSuccessResponse(res, "Participation fetched successfully.", participation);
        }catch(error:any){
            logger.error("Error in Get Participation By User Id endpoint.")
            return sendErrorResponse(res, error.message, "Error while fetching participation");
        }
    }

    updateParticipation=async(req:Request, res:Response):Promise<any>=>{
        logger.info("Update Participation endpoint hit.")
        try{
           
            const participationId=req.params.participationId as unknown as Schema.Types.ObjectId;
            const participation=await this.tournamentParticipationService.updateParticipation(participationId, req.body);
            logger.info("Participation updated successfully.")
            return sendSuccessResponse(res, "Participation updated successfully.", participation);
        }catch(error:any){
            logger.error("Error in Update Participation endpoint.")
            return sendErrorResponse(res, error.message, "Error while updating participation");
        }
    }
}

export default new TournamentParticipationController();