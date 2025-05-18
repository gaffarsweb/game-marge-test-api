import { Schema } from "mongoose";
import { CustomRequest } from "../interfaces/auth.interface";
import { AirdropEventService } from "../services/airdropEvent.service";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";
import { Request, Response } from "express";
import { CustomError } from "../utils/custom-error";
import { GetClaimsParams } from "../interfaces/airdropEvent.interface";

class AirdropEventCotroller {
    constructor(private airdropEventService: AirdropEventService = new AirdropEventService()) { }
    createAirdropEvent = async (req: Request, res: Response): Promise<any> => {
        try {
            const airdropEvent = await this.airdropEventService.createAirdropEvent(req.body);
            return sendSuccessResponse(res, "Airdrop Event created successfully.", airdropEvent);
        } catch (error: any) {
            logger.error("Error creating airdrop event: ", error.message);
            return sendErrorResponse(res, "Error creating airdrop event", error.message);
        }

    }
    getActiveAirdropEvents = async (req: CustomRequest, res: Response): Promise<any> => {
        const userId = req.user?.id!
        try {
            const airdropEvents = await this.airdropEventService.getActiveAirdrop(userId);
            return sendSuccessResponse(res, "Active Airdrop Events fetched successfully.", airdropEvents);
        } catch (error: any) {
            if(error instanceof CustomError){
                return sendErrorResponse(res,error,error.message,error.statusCode);
            }
            logger.error("Error fetching active airdrop events: ", error.message);
            return sendErrorResponse(res, "Error fetching active airdrop events", error.message);
        }
    }
    getAirdropEventById = async (req: Request, res: Response): Promise<any> => {
        try {
            const airdropEvent = await this.airdropEventService.getAirdropEventById(req.params.id);
            if (!airdropEvent) {
                logger.error("Airdrop Event not found.");
                return sendErrorResponse(res, "Airdrop Event not found", "Airdrop Event not found");
            }
            return sendSuccessResponse(res, "Airdrop Event fetched successfully.", airdropEvent);
        } catch (error: any) {
            logger.error("Error fetching airdrop event by ID: ", error.message);
            return sendErrorResponse(res, "Error fetching airdrop event by ID", error.message);
        }
    }
    updateAirdropEvent = async (req: Request, res: Response): Promise<any> => {
        try {
            const airdropEvent = await this.airdropEventService.updateAirdropEvent(req.params.id, req.body);
            if (!airdropEvent) {
                logger.error("Airdrop Event not found.");
                return sendErrorResponse(res, "Airdrop Event not found", "Airdrop Event not found");
            }
            return sendSuccessResponse(res, "Airdrop Event updated successfully.", airdropEvent);
        } catch (error: any) {
            logger.error("Error updating airdrop event: ", error.message);
            return sendErrorResponse(res, "Error updating airdrop event", error.message);
        }
    }
    deleteAirdropEvent = async (req: Request, res: Response): Promise<any> => {
        try {
            await this.airdropEventService.deleteAirdropEvent(req.params.id);
            return sendSuccessResponse(res, "Airdrop Event deleted successfully.", null);
        } catch (error: any) {
            logger.error("Error deleting airdrop event: ", error.message);
            return sendErrorResponse(res, error.message, "Error deleting airdrop event");
        }
    }
    claimAirdrop = async (req: CustomRequest, res: Response): Promise<any> => {
        const userId = req.user?.id!
        try {
            const { lootPointsToClaim, airdropId } = req.body;
            const result = await this.airdropEventService.claimAirdrop(userId, airdropId, lootPointsToClaim);
            return sendSuccessResponse(res, "Airdrop claimed successfully.", result);
        } catch (error: any) {
            logger.error("Error claiming airdrop: ", error.message);
            if (error instanceof CustomError) {
                return sendErrorResponse(res, error, error.message, error.statusCode);
            }
            return sendErrorResponse(res, "Error claiming airdrop", error.message);
        }
    }
    getPendingAirdropClaims = async (req: Request, res: Response): Promise<any> => {
        try {
            const pendingClaims = await this.airdropEventService.getPendingAirdropClaims();
            return sendSuccessResponse(res, "Pending Airdrop Claims fetched successfully.", pendingClaims);
        } catch (error: any) {
            logger.error("Error fetching pending airdrop claims: ", error.message);
            return sendErrorResponse(res, "Error fetching pending airdrop claims", error.message);
        }
    }
    approveAirdropClaim = async (req: Request, res: Response): Promise<any> => {
        try {
            const airdropClaimRequestId = (req.params.id as any) as Schema.Types.ObjectId;
            const body = req?.body as any
            const result = await this.airdropEventService.approveAirdropClaim(airdropClaimRequestId,body);
            return sendSuccessResponse(res, "Airdrop Claim approved successfully.", result);
        } catch (error: any) {
            logger.error("Error approving airdrop claim: ", error.message);
            return sendErrorResponse(res, "Error approving airdrop claim", error.message);
        }

    }
    rejectAirdropClaim = async (req: Request, res: Response): Promise<any> => {
        try {
            const airdropClaimRequestId = (req.params.id as any) as Schema.Types.ObjectId;
            const result = await this.airdropEventService.rejectAirdropClaim(airdropClaimRequestId, req.body.adminNote);
            return sendSuccessResponse(res, "Airdrop Claim rejected successfully.", result);
        } catch (error: any) {
            logger.error("Error rejecting airdrop claim: ", error.message);
            return sendErrorResponse(res, "Error rejecting airdrop claim", error.message);
        }
    }

    getClaimsByAirdropId = async (req: Request, res: Response): Promise<any> => {
        try {
            const airdropId = req.params.id as unknown as Schema.Types.ObjectId;
            const { status, page = 1, limit = 10 } = req.query;
            const payload = { airdropId, status, page, limit } as GetClaimsParams;
            const result = await this.airdropEventService.getClaimsByAirdropId(payload);
            return sendSuccessResponse(res, "Claims fetched successfully.", result);
        } catch (error: any) {
            logger.error("Error fetching claims by airdrop ID: ", error.message);
            return sendErrorResponse(res, "Error fetching claims by airdrop ID", error.message);
        }
    }
    getAllAirdropEvents = async (req: Request, res: Response): Promise<any> => {
        try {
            const { page = "1", limit = "10", search = "", sort = "" } = req.query as { page?: string; limit?: string; search?: string; sort?: string;};
            const airdropEvents = await this.airdropEventService.findAllAirdropEvents({page , limit , search , sort});
            return sendSuccessResponse(res, "All Airdrop Events fetched successfully.", airdropEvents);
        } catch (error: any) {
            logger.error("Error fetching all airdrop events: ", error.message);
            return sendErrorResponse(res, "Error fetching all airdrop events", error.message);
        }
    }
}

export default new AirdropEventCotroller();