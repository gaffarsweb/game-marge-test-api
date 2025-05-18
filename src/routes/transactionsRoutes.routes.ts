import { Router } from "express";
import transationController from "../controllers/transactions.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.get(
  "/all/in-game",
  authenticateRequest,
  transationController.getAllInGameCoinTransactions
);

router.get(
  "/get-coins-transactions",
  authenticateRequest,
  transationController.getCoinsTransactions
);

router.get(
  "/wallet/get-all-transactions",
  authenticateRequest,
  transationController.getAllTransations
);

router.get(
  "/get-all-transaction-admin",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  transationController.getAllTransactionsForAdmin
);


export default router;
