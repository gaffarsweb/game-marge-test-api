import { Router } from "express";
import referralCollection from "../controllers/referral.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();


router.get(
  "/get/referral-list",
  authenticateRequest,
  referralCollection.getReferralHistory
);
router.get(
  "/get/all-referral-list/admin",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  referralCollection.getAllReferralHistory
);
router.get(
  "/get/referral-list-by-id/admin/:id",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  referralCollection.getReferralListByUserId
);

export default router;
