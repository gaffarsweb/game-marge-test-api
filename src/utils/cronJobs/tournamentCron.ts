import cron from "node-cron";
import { distributeTournamentRewards } from "../../services/tournamentReward.service";
import { logger } from "../logger";
import Tournament from "../../models/tournament.model";

export const startTournamentRewardCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    logger.info("Running tournament reward cron...");
    try {
      await distributeTournamentRewards();
    } catch (error: any) {
      logger.error(`Reward distribution failed:"${error.message}`);
    }
  });
};

export const startTournamentStatusUpdateCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    logger.info("Running tournament status update cron...");

    const now = new Date();

    try {
      // 1. Update to "ongoing"
      const ongoingResult = await Tournament.updateMany(
        {
          startTime: { $lte: now },
          endTime: { $gt: now },
          status: { $ne: "ongoing" }
        },
        { $set: { status: "ongoing" } }
      );
      logger.info(`✅ Updated to ongoing: ${ongoingResult.modifiedCount}`);

      // 2. Update to "completed"
      const completedResult = await Tournament.updateMany(
        {
          endTime: { $lte: now },
          status: { $ne: "completed" }
        },
        { $set: { status: "completed" } }
      );
      logger.info(`✅ Updated to completed: ${completedResult.modifiedCount}`);

      // 3. Update to "upcoming" if modified
      const upcomingResult = await Tournament.updateMany(
        {
          startTime: { $gt: now },
          status: { $ne: "upcoming" }
        },
        { $set: { status: "upcoming" } }
      );
      logger.info(`✅ Updated to upcoming: ${upcomingResult.modifiedCount}`);
    } catch (error: any) {
      logger.error("❌ Error in tournament status cron:", error.message || error);
    }
  });
};
