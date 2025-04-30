import { Schema } from "mongoose";
import { IAirdropEvent } from "../models/airdropEvent.model";
import { AirdropEventRepository } from "../repositories/airdropEvent.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";
import InGameCoinWallet from "../models/inGameCoinWallet.model";
import airdropClaimLogModel, { IAirdropClaimLog } from "../models/airdropClaimLog.model";
import InGameCoinTransactions from "../models/inGameCoinTransations.model";
import { GetClaimsParams } from "../interfaces/airdropEvent.interface";
import { SettingsService } from "./setting.service";
import { AuthService } from "./auth.service";
import { transactionType } from "../utils/enums";

export class AirdropEventService {
  constructor(
    private airdropEventRepository: AirdropEventRepository = new AirdropEventRepository(),
    private settingService: SettingsService = new SettingsService(),
    private authService: AuthService = new AuthService()
  ) { }

  async createAirdropEvent(data: IAirdropEvent): Promise<IAirdropEvent> {
    return await this.airdropEventRepository.createAirdropEvent(data);
  }

  getActiveAirdrop = async (userId: Schema.Types.ObjectId) => {
    const airdrop = await this.airdropEventRepository.getActiveAirdrop();

    if (!airdrop) {
      throw new CustomError("No active airdrop found", HTTP_STATUS.NOT_FOUND);
    }

    const hasClaimed = await this.airdropEventRepository.hasUserClaimed(userId, airdrop._id as Schema.Types.ObjectId);

    return {
      airdrop: {
        _id: airdrop._id,
        name: airdrop.name,
        startTime: airdrop.startTime,
        endTime: airdrop.endTime,
        // conversionRate: airdrop.conversionRate
      },
      hasClaimed
    }
  };
  async getAirdropEventById(id: string): Promise<IAirdropEvent | null> {
    return await this.airdropEventRepository.getAirdropEventById(id);
  }

  async updateAirdropEvent(id: string, data: Partial<IAirdropEvent>): Promise<IAirdropEvent | null> {
    return await this.airdropEventRepository.updateAirdropEvent(id, data);
  }

  async deleteAirdropEvent(id: string): Promise<void> {
    await this.airdropEventRepository.deleteAirdropEvent(id);
  }
  async claimAirdrop(
    userId: Schema.Types.ObjectId,
    airdropId: Schema.Types.ObjectId,
    lootPointsToClaim: number
  ) {
    // 1. Fetch the airdrop event
    const airdrop = await this.airdropEventRepository.getActiveAirdropByAridropId(airdropId);
    if (!airdrop) throw new CustomError("No active airdrop available", HTTP_STATUS.NOT_FOUND);

    const currency = airdrop.currency; // <- this should exist in your AirdropEvent model
    if (!currency) throw new CustomError("Airdrop event has no target currency", HTTP_STATUS.BAD_REQUEST);
    const network = airdrop.network; // <- this should exist in your AirdropEvent model
    if (!network) throw new CustomError("Airdrop event has no target network", HTTP_STATUS.BAD_REQUEST);

    // 2. Check if already claimed
    const alreadyClaimed = await this.airdropEventRepository.hasUserClaimed(userId, airdrop._id as Schema.Types.ObjectId);
    if (alreadyClaimed) throw new Error("You have already claimed this airdrop");

    // 3. Get user's in-game wallet
    const userInGameWallet = await this.airdropEventRepository.getUserInGameWallet(userId);
    if (!userInGameWallet || userInGameWallet.balance < lootPointsToClaim) {
      throw new Error("Insufficient loot points");
    }

    // 4. Get conversion rate from Settings
    const settings = await this.settingService.getSettings();
    if (!settings) throw new CustomError("Settings not found", HTTP_STATUS.NOT_FOUND);

    const conversion = settings.lootToCoinConversion.find((item: { currency: string, rate: number, network: string }) => item.currency === currency && network === item.network);
    if (!conversion) {
      throw new CustomError(`Conversion rate for ${currency} not configured`, HTTP_STATUS.BAD_REQUEST);
    }

    const coins = Number((lootPointsToClaim / conversion.rate).toFixed(4)); // Rounded to 4 decimal places

    // 5. Check duplicate claim log
    const existing = await airdropClaimLogModel.findOne({
      userId,
      airdropId: airdrop._id,
      status: { $in: ["pending", "approved"] }
    });
    if (existing) throw new Error("You already submitted or claimed this airdrop");

    // 6. Deduct lootPoints from wallet
    userInGameWallet.balance -= lootPointsToClaim;
    await userInGameWallet.save();

    // 7. Create pending claim
    await airdropClaimLogModel.create({
      userId,
      airdropId: airdrop._id,
      lootPointsClaimed: lootPointsToClaim,
      coinsReceived: coins,
      currency: airdrop.currency,
      network: airdrop.network,
      status: "pending"
    });

    return {
      message: "Airdrop claim request submitted and awaiting admin approval",
      coinsExpected: coins
    };
  }
  async getPendingAirdropClaims(): Promise<IAirdropClaimLog[]> {
    return await this.airdropEventRepository.getPendingAirdropClaims();
  }
  async approveAirdropClaim(airdropClaimRequestId: Schema.Types.ObjectId, body: any): Promise<any> {
    const claim = await this.airdropEventRepository.findAirdropClaimLogById(airdropClaimRequestId);
    if (!claim || claim.status !== 'pending') {
      throw new CustomError("Claim not found or already processed", HTTP_STATUS.NOT_FOUND);
    }

    await this.authService.updateWalletBalance(claim.userId, body.currency ? body.currency : claim.currency, body.network, claim.coinsReceived, `airdrop claim approved by admin `, transactionType.airDropClaim);

    claim.status = 'approved';
    claim.approvedAt = new Date();
    await claim.save();

    return { message: 'Claim approved and coins granted' };
  };

  async rejectAirdropClaim(airdropClaimRequestId: Schema.Types.ObjectId, adminNote?: string): Promise<any> {

    const claim = await this.airdropEventRepository.findAirdropClaimLogById(airdropClaimRequestId);
    if (!claim || claim.status !== 'pending') {
      throw new CustomError("Claim not found or already processed", HTTP_STATUS.NOT_FOUND);
    }
    const userInGameWallet = await this.airdropEventRepository.getUserInGameWallet(claim.userId);
    if (!userInGameWallet) throw new Error("User wallet not found")
    userInGameWallet.balance += claim.lootPointsClaimed;
    await userInGameWallet.save();
    claim.status = 'rejected';
    claim.adminNote = adminNote || "";
    claim.rejectedAt = new Date();
    await claim.save();

    return { message: 'Claim rejected successfully' };
  };

  async getClaimsByAirdropId(payload: GetClaimsParams): Promise<any> {
    return await this.airdropEventRepository.getClaimsByAirdropId(payload);
  };
  async findAllAirdropEvents(query: { page?:string, limit?: string, search?:string, sort?:string}): Promise<{ airdropEvents: IAirdropEvent[]; total: number }> {
    const events = await this.airdropEventRepository.getAllAirdropEvents(query);
    if (!events || events.airdropEvents.length === 0) throw new CustomError("No airdrop events found", HTTP_STATUS.NOT_FOUND);
    return events;
  }
}