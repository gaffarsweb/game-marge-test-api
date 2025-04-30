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
        logger.info("Create Airdrop Event endpoint hit.");
        try {
            const airdropEvent = await this.airdropEventService.createAirdropEvent(req.body);
            logger.info("Airdrop Event created successfully.", airdropEvent);
            return sendSuccessResponse(res, "Airdrop Event created successfully.", airdropEvent);
        } catch (error: any) {
            logger.error("Error creating airdrop event: ", error.message);
            return sendErrorResponse(res, "Error creating airdrop event", error.message);
        }

    }
    getActiveAirdropEvents = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Get Active Airdrop Events endpoint hit.");
        const userId = req.user?.id!
        try {
            const airdropEvents = await this.airdropEventService.getActiveAirdrop(userId);
            logger.info("Active Airdrop Events fetched successfully.", airdropEvents);
            return sendSuccessResponse(res, "Active Airdrop Events fetched successfully.", airdropEvents);
        } catch (error: any) {
            logger.error("Error fetching active airdrop events: ", error.message);
            return sendErrorResponse(res, "Error fetching active airdrop events", error.message);
        }
    }
    getAirdropEventById = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get Airdrop Event by ID endpoint hit.");
        try {
            const airdropEvent = await this.airdropEventService.getAirdropEventById(req.params.id);
            if (!airdropEvent) {
                logger.error("Airdrop Event not found.");
                return sendErrorResponse(res, "Airdrop Event not found", "Airdrop Event not found");
            }
            logger.info("Airdrop Event fetched successfully.", airdropEvent);
            return sendSuccessResponse(res, "Airdrop Event fetched successfully.", airdropEvent);
        } catch (error: any) {
            logger.error("Error fetching airdrop event by ID: ", error.message);
            return sendErrorResponse(res, "Error fetching airdrop event by ID", error.message);
        }
    }
    updateAirdropEvent = async (req: Request, res: Response): Promise<any> => {
        logger.info("Update Airdrop Event endpoint hit.");
        try {
            const airdropEvent = await this.airdropEventService.updateAirdropEvent(req.params.id, req.body);
            if (!airdropEvent) {
                logger.error("Airdrop Event not found.");
                return sendErrorResponse(res, "Airdrop Event not found", "Airdrop Event not found");
            }
            logger.info("Airdrop Event updated successfully.", airdropEvent);
            return sendSuccessResponse(res, "Airdrop Event updated successfully.", airdropEvent);
        } catch (error: any) {
            logger.error("Error updating airdrop event: ", error.message);
            return sendErrorResponse(res, "Error updating airdrop event", error.message);
        }
    }
    deleteAirdropEvent = async (req: Request, res: Response): Promise<any> => {
        logger.info("Delete Airdrop Event endpoint hit.");
        try {
            await this.airdropEventService.deleteAirdropEvent(req.params.id);
            logger.info("Airdrop Event deleted successfully.");
            return sendSuccessResponse(res, "Airdrop Event deleted successfully.", null);
        } catch (error: any) {
            logger.error("Error deleting airdrop event: ", error.message);
            return sendErrorResponse(res, error.message, "Error deleting airdrop event");
        }
    }
    claimAirdrop = async (req: CustomRequest, res: Response): Promise<any> => {
        logger.info("Claim Airdrop endpoint hit.");
        const userId = req.user?.id!
        try {
            const { lootPointsToClaim, airdropId } = req.body;
            const result = await this.airdropEventService.claimAirdrop(userId, airdropId, lootPointsToClaim);
            logger.info("Airdrop claimed successfully.", result);
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
        logger.info("Get Pending Airdrop Claims endpoint hit.");
        try {
            const pendingClaims = await this.airdropEventService.getPendingAirdropClaims();
            logger.info("Pending Airdrop Claims fetched successfully.", pendingClaims);
            return sendSuccessResponse(res, "Pending Airdrop Claims fetched successfully.", pendingClaims);
        } catch (error: any) {
            logger.error("Error fetching pending airdrop claims: ", error.message);
            return sendErrorResponse(res, "Error fetching pending airdrop claims", error.message);
        }
    }
    approveAirdropClaim = async (req: Request, res: Response): Promise<any> => {
        logger.info("Approve Airdrop Claim endpoint hit.");
        try {
            const airdropClaimRequestId = (req.params.id as any) as Schema.Types.ObjectId;
            const body = req?.body as any
            const result = await this.airdropEventService.approveAirdropClaim(airdropClaimRequestId,body);
            logger.info("Airdrop Claim approved successfully.", result);
            return sendSuccessResponse(res, "Airdrop Claim approved successfully.", result);
        } catch (error: any) {
            logger.error("Error approving airdrop claim: ", error.message);
            return sendErrorResponse(res, "Error approving airdrop claim", error.message);
        }

    }
    rejectAirdropClaim = async (req: Request, res: Response): Promise<any> => {
        logger.info("Reject Airdrop Claim endpoint hit.");
        try {
            const airdropClaimRequestId = (req.params.id as any) as Schema.Types.ObjectId;
            const result = await this.airdropEventService.rejectAirdropClaim(airdropClaimRequestId, req.body.adminNote);
            logger.info("Airdrop Claim rejected successfully.", result);
            return sendSuccessResponse(res, "Airdrop Claim rejected successfully.", result);
        } catch (error: any) {
            logger.error("Error rejecting airdrop claim: ", error.message);
            return sendErrorResponse(res, "Error rejecting airdrop claim", error.message);
        }
    }

    getClaimsByAirdropId = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get Claims By Airdrop ID endpoint hit.");
        try {
            const airdropId = req.params.id as unknown as Schema.Types.ObjectId;
            const { status, page = 1, limit = 10 } = req.query;
            const payload = { airdropId, status, page, limit } as GetClaimsParams;
            const result = await this.airdropEventService.getClaimsByAirdropId(payload);
            logger.info("Claims fetched successfully.");
            return sendSuccessResponse(res, "Claims fetched successfully.", result);
        } catch (error: any) {
            logger.error("Error fetching claims by airdrop ID: ", error.message);
            return sendErrorResponse(res, "Error fetching claims by airdrop ID", error.message);
        }
    }
    getAllAirdropEvents = async (req: Request, res: Response): Promise<any> => {
        logger.info("Get All Airdrop Events endpoint hit.");
        try {
            const { page = "1", limit = "10", search = "", sort = "" } = req.query as { page?: string; limit?: string; search?: string; sort?: string;};
            const airdropEvents = await this.airdropEventService.findAllAirdropEvents({page , limit , search , sort});
            logger.info("All Airdrop Events fetched successfully.", airdropEvents);
            return sendSuccessResponse(res, "All Airdrop Events fetched successfully.", airdropEvents);
        } catch (error: any) {
            logger.error("Error fetching all airdrop events: ", error.message);
            return sendErrorResponse(res, "Error fetching all airdrop events", error.message);
        }
    }
}

export default new AirdropEventCotroller();