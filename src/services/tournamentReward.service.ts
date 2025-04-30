import Tournament from "../models/tournament.model";
import  TournamentParticipation  from "../models/tournamentParticipation.model";
import { Types } from "mongoose";
import { creditRewardToUser } from "../utils/wallet.utils";
import { logger } from "../utils/logger";

export const distributeTournamentRewards = async () => {
  const now = new Date();

  logger.info("Reading completed tournaments...")
  const tournaments = await Tournament.find({
    endTime: { $lte: now },
    isRewarded: { $ne: true },
    isActive: true
  });
  logger.info(`Found ${tournaments.length} completed tournaments.`);
  for (const tournament of tournaments) {
    const tournamentId = tournament._id as Types.ObjectId;
    const topParticipants = await TournamentParticipation.aggregate([
      { $match: { tournamentId: tournamentId } },
      { $sort: { score: -1 } },
      {
        $group: {
          _id: "$userId",
          score: { $first: "$score" }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 25 }
    ]);
     logger.info(`Top 25 participants: ${topParticipants}`); 
    for (let i = 0; i < topParticipants.length; i++) {
      const userId = topParticipants[i]._id;
      const rewardObj = tournament.rewardDistribution.find(r => r.position === i + 1);
      if (!rewardObj || rewardObj.amount <= 0) continue;
   
      const rewardAmount = rewardObj.amount;
      const currency = tournament.currency;
      const network = tournament.network;

      await creditRewardToUser(userId, rewardAmount, currency, network, `Tournament reward for rank ${i + 1}`);
    }

    tournament.isRewarded = true;
    tournament.status = "completed";
    await tournament.save();
    logger.info(`✅ Rewards distributed for tournament: ${tournament.name}`);
  }
};
