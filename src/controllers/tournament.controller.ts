import { Request,Response } from "express";
import { TournamentService } from "../services/tournaments.service";
import { logger } from "../utils/logger";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResponse";
import { Schema } from "mongoose";
import { CustomError } from "../utils/custom-error";
import { GetTournamentsParams } from "../interfaces/tournament.interface";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomRequest } from "../interfaces/auth.interface";

class TournamentController{
    constructor(private tournamentService:TournamentService=new TournamentService()){}
     
    getAllTournamentsForApp=async(req:Request,res:Response):Promise<any>=> {
        logger.info("Get all tournaments by game id endpoint hit.");
        try {
            const tournaments = await this.tournamentService.getAllTournamentsForApp(req.query);
            logger.info("Tournaments fetched successfully.");
            return sendSuccessResponse(res, "Tournaments fetched successfully", tournaments);
        } catch (error:any) {
            logger.error("Error fetching tournaments:", error);
            if(error instanceof CustomError) {
                return sendErrorResponse(res,error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching tournaments");
        }
    }
    getAllTournaments=async(req:Request,res:Response):Promise<any>=> {
        logger.info("Get all tournaments endpoint hit.");
        try {
            const {page,limit, search="", sort="", filter = "{}"}=req.query as unknown as GetTournamentsParams;
            const tournaments = await this.tournamentService.getAllTournaments({page,limit, search, sort, filter});
            logger.info("Tournaments fetched successfully.");
            return sendSuccessResponse(res, "Tournaments fetched successfully", tournaments);
        } catch (error:any) {
            logger.error("Error fetching tournaments:", error);
            if(error instanceof CustomError) {
                return sendErrorResponse(res,error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching tournaments");
        }
    }

     createTournament=async(req:Request,res:Response):Promise<any>=> {
        logger.info("Create tournament endpoint hit.");
        try {
            const tournament = await this.tournamentService.createTournament(req.body);
            logger.info("Tournament created successfully.");
            return sendSuccessResponse(res, "Tournament created successfully", tournament);
        } catch (error:any) {
            logger.error("Error creating tournament:", error);
            if(error.code===11000)return sendErrorResponse(res,error.message,"A tournament already exist with same name",HTTP_STATUS.BAD_REQUEST)
            return sendErrorResponse(res, "Error creating tournament");
        }
    }

    getTournamentById=async(req:Request,res:Response):Promise<any>=> {
        logger.info("Get tournament by ID endpoint hit.");
        try {
            const tournamentId = (req.params.id as unknown) as Schema.Types.ObjectId;
            const tournament = await this.tournamentService.getTournamentById(tournamentId);
            logger.info("Tournament fetched successfully.");
            return sendSuccessResponse(res, "Tournament fetched successfully", tournament);
        } catch (error:any) {
            logger.error("Error fetching tournament:", error);
            if(error instanceof CustomError) {
                return sendErrorResponse(res,error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching tournament");
        }
    }
    getTournamentDetailsById=async(req:CustomRequest, res:Response):Promise<any>=> {
        logger.info("Get tournament details by ID endpoint hit.");
        try {
            const tournamentId = req.params.id 
            const userId = req.user?.id!;
            const tournament = await this.tournamentService.getTournamentDetailsById(tournamentId,userId);
            logger.info("Tournament details fetched successfully.");
            return sendSuccessResponse(res, "Tournament details fetched successfully", tournament);
        } catch (error:any) {
            logger.error("Error fetching tournament details:", error);
            if(error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching tournament details");
        }
    }
    updateTournament=async(req:Request,res:Response):Promise<any>=> {
        logger.info("Update tournament endpoint hit.");
        try {
            const tournamentId = (req.params.id as unknown) as Schema.Types.ObjectId;
            const updatedTournament = await this.tournamentService.updateTournament(tournamentId, req.body);
            logger.info("Tournament updated successfully.");
            return sendSuccessResponse(res, "Tournament updated successfully", updatedTournament);
        } catch (error:any) {
            logger.error("Error updating tournament:", error);
            return sendErrorResponse(res,error.message, "Error updating tournament");
        }
    }
    deleteTournament=async(req:Request,res:Response):Promise<any>=> {
        logger.info("Delete tournament endpoint hit.");
        try {
            const tournamentId = (req.params.id as unknown) as Schema.Types.ObjectId;
            await this.tournamentService.deleteTournament(tournamentId);
            logger.info("Tournament deleted successfully.");
            return sendSuccessResponse(res, "Tournament deleted successfully");
        } catch (error:any) {
            logger.error("Error deleting tournament:", error);
            return sendErrorResponse(res,error.message, "Error deleting tournament");
        }
    }
    
    getTournamentDetailsForAdmin=async(req:Request, res:Response):Promise<any>=> {
        logger.info("Get tournament details for admin endpoint hit.");
        try {
            const tournamentId = req.params.id
            const { page=1, limit =10, email, sortBy, order } = req.query as { page?: number; limit?: number; email?: string; sortBy?: string; order?: "asc" | "desc" };
            const tournament = await this.tournamentService.getTournamentDetailsForAdmin(tournamentId, { page, limit, email, sortBy, order });
            logger.info("Tournament details fetched successfully.");
            return sendSuccessResponse(res, "Tournament details fetched successfully", tournament);
        } catch (error:any) {
            logger.error("Error fetching tournament details:", error);
            if(error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching tournament details");
        }
    }

    getTournamentParticipations=async(req:Request, res:Response):Promise<any>=> {
        try {
            const tournamentId = req.params.id
            const { page, limit, search = "", sort = "" } = req.query as unknown as GetTournamentsParams;
            const tournamentParticipation = await this.tournamentService.getTournamentParticipations(tournamentId, { page, limit , search, sort});

            logger.info("Tournament details fetched successfully.");
            return sendSuccessResponse(res, "Tournament details fetched successfully", tournamentParticipation);
        } catch (error:any) {
            logger.error("Error fetching tournament details:", error);
            if(error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching tournament details");
        }
    }

    getTournamentWithoutPage=async(req:Request,res:Response):Promise<any>=> {
        logger.info("Get all tournaments endpoint hit.");
        try {
            const tournaments = await this.tournamentService.getTournamentWithoutPage();
            logger.info("Tournaments fetched successfully.");
            return sendSuccessResponse(res, "Tournaments fetched successfully", tournaments);
        } catch (error:any) {
            logger.error("Error fetching tournaments:", error);
            if(error instanceof CustomError) {
                return sendErrorResponse(res,error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error fetching tournaments");
        }
    }
}
export default new  TournamentController();