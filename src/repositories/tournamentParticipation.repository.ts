import { Schema } from "mongoose";
import { ITournamentParticipationRepository } from "../interfaces/tournamentParticipation.interface";
import Tournament from "../models/tournament.model";
import TournamentParticipation, { ITournamentParticipation } from "../models/tournamentParticipation.model";
import Wallet from "../models/wallet.model";
import Transaction from "../models/transaction.model";
import { referralBonusType, transactionStatus, transactionType } from "../utils/enums";
import Settings from "../models/setting.model";
import { AuthRepository } from './auth.repository';
import userModel from "../models/user.model";

export class TournamentParticipationRepository implements ITournamentParticipationRepository {
  async getParticipationByTournamentId(tournamentId: Schema.Types.ObjectId): Promise<ITournamentParticipation[]> {
    return await TournamentParticipation.find({ tournamentId });
  }
  async getParticipationByUserId(userId: Schema.Types.ObjectId): Promise<any> {
    return await TournamentParticipation.findOne({ userId });
  }
  async joinTournament(userId: Schema.Types.ObjectId, tournamentId: Schema.Types.ObjectId): Promise<any> {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const now = new Date();
    if (now < tournament.startTime || now > tournament.endTime) {
      throw new Error("Tournament is not active");
    }

    // Get user's wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("User wallet not found");

    // Find matching currency and network in balances
    const coin = wallet.balances.find(
      (b) =>
        b.currency === tournament.currency &&
        b.network === tournament.network
    );

    if (!coin || coin.availableBalance < tournament.entryFee) {
      throw new Error("Insufficient balance");
    }

    // Deduct entry fee
    coin.availableBalance -= tournament.entryFee;

    // Mark balances as modified to ensure Mongoose updates it
    wallet.markModified("balances");
    await wallet.save();

    const findIfParticipatied = await TournamentParticipation.findOne({ userId });
    const setting = await Settings.findOne();
    const user = await userModel.findById(userId);
    const referrer = await userModel.findOne({referralCode: user?.referredBy})

    if (!findIfParticipatied && referrer && setting?.referral_bonus?.referralBonusType === referralBonusType.ON_FIRST_TOURNAMENT) {
      let referredImg = setting?.defaultImgs?.find(img => img?.name === "referred");
      const referredUrl: string = referredImg ? referredImg?.imgUrl : "";
      const referrerId = referrer?._id;
      const { currency, amount, network } = setting?.referral_bonus;
      const authRepo = new AuthRepository();
      await authRepo.updateWalletBalance(referrerId, currency, amount, network, 'Received a reward for referring a friend after played first tournament.', transactionType.reward);
      await authRepo.updateInGameWalletBalance(referrerId, setting?.referral_bonus_loot_coin, 'reward', 'Received a reward for referring a friend after played first tournament.', 'Referred friend', referredUrl);
    }
    // Create tournament participation
    const participation = await TournamentParticipation.create({
      userId,
      tournamentId,
      score: 0,
    });

    // Log transaction
    await Transaction.create({
      userId,
      transactionAmount: tournament.entryFee,
      transactionType: transactionType.SPENDING,
      transactionStatus: transactionStatus.SUCCESS,
      currency: tournament.currency,
      network: coin.network,
      remarks: `Tournament entry: ${tournament.name}`,
    });

    return participation;
  }

  async updateParticipation(participationId: Schema.Types.ObjectId, participationData: Partial<ITournamentParticipation>): Promise<ITournamentParticipation> {
    const updatedParticipation = await TournamentParticipation.findByIdAndUpdate(participationId, participationData, { new: true });
    if (!updatedParticipation) throw new Error("Participation not found");
    return updatedParticipation;
  }
  deleteParticipation(participationId: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  getLeaderboardByTournamentId(tournamentId: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

}
