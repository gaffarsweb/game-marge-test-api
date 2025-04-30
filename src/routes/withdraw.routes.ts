import { Router } from "express";
import withdrawController from "../controllers/withdraw.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";

const router = Router();


router.post(
  "/send-withdraw-request",
  authenticateRequest,
  withdrawController.sendWithdrawRequest
);
router.post(
  "/verify-withdraw-request",
  authenticateRequest,
  withdrawController.verifyWithdrawRequest
);
router.post(
  "/resent-withdraw-request-verification",
  authenticateRequest,
  withdrawController.resentWithdrawRequestVerification
);
router.post(
  "/approve-request",
  authenticateRequest,
  withdrawController.approveRequest
);
router.post(
  "/reject-request",
  authenticateRequest,
  withdrawController.rejectRequest
);

router.get(
  "/all-withdrawal-request",
  authenticateRequest,
  withdrawController.allWithdrawalRequests
);


export default router;
