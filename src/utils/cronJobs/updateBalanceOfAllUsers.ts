import cron from "node-cron";
import WalletService from "../../services/wallet.service";
import { logger } from "../logger";
import Tournament from "../../models/tournament.model";

export const updateBalanceOfAllUsers = () => {
  cron.schedule("*/5 * * * *", async () => {
    logger.info("Running wallet balance update cron (every 15 mins)...");
    try {
      await WalletService.updateWalletBalance();
    } catch (error: any) {
      logger.error(`Wallet balance update failed: "${error.message}"`);
    }
  });
};
