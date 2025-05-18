import cron from "node-cron";
import AirdropCampaign from "../../models/airdrop.model";
import { logger } from "../logger";

export const startAirdropStatusUpdateCron = (): void => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();

      const result = await AirdropCampaign.updateMany(
        { endAt: { $lt: now }, isActive: true },
        { $set: { isActive: false } }
      );

    //   logger.info(
    //     `[Airdrop Cron] Marked ${result.modifiedCount} airdrops as inactive.`
    //   );
    } catch (err) {
      logger.error(`[Airdrop Cron] Failed to update airdrops`, err);
    }
  });
};
