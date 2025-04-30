import { Router } from "express";
import walletController from "../controllers/wallet.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";

const router = Router();


router.post(
  "/check-deposit",
  authenticateRequest,
  walletController.checkDeposit
);
router.get(
  "/in-game-wallet",
  authenticateRequest,
  walletController.getInGameWallet
);
router.get(
  "/fetch-wallet-balance",
  authenticateRequest,
  walletController.fetchWalletBalances
);
router.get(
  "/fetch-network",
  authenticateRequest,
  walletController.fetchNetworks
);
router.get(
  "/fetch-network-coins",
  authenticateRequest,
  walletController.fetchNetworksCoins
);
router.get(
  "/fetch-network-by-coins/:coin",
  authenticateRequest,
  walletController.fetchNetworksByCoins
);
router.get(
  "/fetch-token-by-network/:network",
  authenticateRequest,
  walletController.fetchTokenByNetwork
);
router.get(
  "/wallet-balance-by-id/:id",
  authenticateRequest,
  walletController.fetchWalletBalanceById
);
router.get(
  "/update-wallet-balance",
  authenticateRequest,
  walletController.updateWalletBalance
);

export default router;
