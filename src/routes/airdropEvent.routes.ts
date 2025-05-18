import express from "express";
import airdropEventController from "../controllers/airdropEvent.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  validateCreateAirdropEvent,
  validateClaimAirdrop,
  validateGetClaimsByAirdropId,
  validateApproveClaim,
  validateRejectClaim,
  validateUpdateAirdropEvent,
  validateDeleteAirdropEvent,
} from "../middlewares/validations/airdropEvent.validations";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = express.Router();

router.post(
  "/airdrop/claim",
  authenticateRequest,
  validateClaimAirdrop,
  validateRequest,
  airdropEventController.claimAirdrop
);
router.post(
  "/admin/airdrop",
  authenticateRequest,
  authorizeRoles(["superAdmin",'admin']),
  validateCreateAirdropEvent,
  validateRequest,
  airdropEventController.createAirdropEvent
);
router.post(
  "/admin/airdrop/claim/:id/approve",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  validateApproveClaim,
  validateRequest,
  airdropEventController.approveAirdropClaim
);
router.post(
  "/admin/airdrop/claim/:id/reject",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  validateRejectClaim,
  validateRequest,
  airdropEventController.rejectAirdropClaim
);
// This route might not be in use and will be removed in future.
router.get(
  "/admin/airdrop/claims/pending",
  authenticateRequest,
  airdropEventController.getPendingAirdropClaims
);
router.get(
  "/admin/airdrop/:id/claims",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  validateGetClaimsByAirdropId,
  validateRequest,
  airdropEventController.getClaimsByAirdropId
);
router.get(
  "/airdrop/active",
  authenticateRequest,
  airdropEventController.getActiveAirdropEvents
);
router.get(
  "/admin/airdrops",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  airdropEventController.getAllAirdropEvents
);
router.put(
  "/admin/airdrop/:id",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  validateUpdateAirdropEvent,
  validateRequest,
  airdropEventController.updateAirdropEvent
);
router.delete(
  "/admin/airdrop/:id",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  validateDeleteAirdropEvent,
  validateRejectClaim,
  airdropEventController.deleteAirdropEvent
);

export default router;
