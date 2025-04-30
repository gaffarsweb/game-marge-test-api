import express from "express";
import airdropController from "../controllers/airdrop.controller";
import { validateClaimTask, validateCreateAirdrop, validateUpdateAirdrop } from "../middlewares/validations/airdrop.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticateRequest } from "../middlewares/authMiddleware";

const router = express.Router();

// Admin routes
router.post("/admin",validateCreateAirdrop,validateRequest, airdropController.createAirdrop);
router.get("/admin/", airdropController.getAllAirdrops);
router.put("/admin/:id",authenticateRequest,validateUpdateAirdrop,validateRequest,airdropController.updateAirdrop);
router.delete("/admin/:id", airdropController.deleteAirdrop);
router.get("/get-airdorp-admin", airdropController.getAirdropWithoutPage);

// User routes
router.get("/active", authenticateRequest, airdropController.getActiveAirdrops);
router.get("/:id",authenticateRequest, airdropController.getAirdropById);
router.post(
    "/:campaignId/tasks/:index/claim",
    authenticateRequest,
    validateClaimTask,
    validateRequest,
    airdropController.claimTaskReward
  );
  

export default router;
