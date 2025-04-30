import { Router } from "express";
import referralCollection from "../controllers/referral.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";

const router = Router();


router.get(
  "/get/referral-list",
  authenticateRequest,
  referralCollection.getReferralHistory
);
router.get(
  "/get/all-referral-list/admin",
  authenticateRequest,
  referralCollection.getAllReferralHistory
);
router.get(
  "/get/referral-list-by-id/admin/:id",
  authenticateRequest,
  referralCollection.getReferralListByUserId
);

export default router;
