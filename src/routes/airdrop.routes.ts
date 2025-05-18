import express from "express";
import airdropController from "../controllers/airdrop.controller";
import { validateClaimTask, validateCreateAirdrop, validateUpdateAirdrop } from "../middlewares/validations/airdrop.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = express.Router();

// Admin routes
router.post("/admin",authenticateRequest,authorizeRoles(["superAdmin",'admin']),validateCreateAirdrop,validateRequest, airdropController.createAirdrop);
router.get("/admin/",authenticateRequest,authorizeRoles(["admin",'superAdmin']) ,airdropController.getAllAirdrops);
router.put("/admin/:id",authenticateRequest,authorizeRoles(["superAdmin",'admin']),validateUpdateAirdrop,validateRequest,airdropController.updateAirdrop);
router.delete("/admin/:id",authenticateRequest,authorizeRoles(['superAdmin','admin']), airdropController.deleteAirdrop);
router.get("/get-airdorp-admin",authenticateRequest,authorizeRoles(["superAdmin",'admin']), airdropController.getAirdropWithoutPage);

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
