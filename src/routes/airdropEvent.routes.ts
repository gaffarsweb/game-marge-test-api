import express from 'express';
import airdropEventController from '../controllers/airdropEvent.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import {validateRequest} from '../middlewares/validateRequest';
import { validateCreateAirdropEvent,validateClaimAirdrop, validateGetClaimsByAirdropId, validateApproveClaim, validateRejectClaim, validateUpdateAirdropEvent, validateDeleteAirdropEvent } from '../middlewares/validations/airdropEvent.validations';

const router = express.Router();


router.post(
  '/airdrop/claim',
  authenticateRequest,
  validateClaimAirdrop,
  validateRequest,
  airdropEventController.claimAirdrop
);
router.post(
  '/admin/airdrop',
  authenticateRequest,
  validateCreateAirdropEvent,
  validateRequest,
  airdropEventController.createAirdropEvent
);
router.post("/admin/airdrop/claim/:id/approve", authenticateRequest,validateApproveClaim,validateRequest, airdropEventController.approveAirdropClaim);
router.post("/admin/airdrop/claim/:id/reject", authenticateRequest,validateRejectClaim,validateRequest, airdropEventController.rejectAirdropClaim);
router.get("/admin/airdrop/claims/pending", authenticateRequest, airdropEventController.getPendingAirdropClaims);
router.get("/admin/airdrop/:id/claims", authenticateRequest,validateGetClaimsByAirdropId,validateRequest, airdropEventController.getClaimsByAirdropId);
router.get('/airdrop/active', authenticateRequest, airdropEventController.getActiveAirdropEvents);
router.get("/admin/airdrops", authenticateRequest, airdropEventController.getAllAirdropEvents);
router.put("/admin/airdrop/:id",authenticateRequest,validateUpdateAirdropEvent,validateRequest,airdropEventController.updateAirdropEvent);
router.delete("/admin/airdrop/:id",authenticateRequest,validateDeleteAirdropEvent,validateRejectClaim,airdropEventController.deleteAirdropEvent);

export default router;
