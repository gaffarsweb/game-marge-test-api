import { Schema } from "mongoose";
import { GetClaimsParams, IAirdropEventRepository } from "../interfaces/airdropEvent.interface";
import AirdropEvent, { IAirdropEvent } from "../models/airdropEvent.model";
import InGameCoinTransactions from "../models/inGameCoinTransations.model";
import InGameCoinWallet, { IWallet } from "../models/inGameCoinWallet.model";
import airdropClaimLogModel, {
	IAirdropClaimLog,
} from "../models/airdropClaimLog.model";

export class AirdropEventRepository implements IAirdropEventRepository {
	async createAirdropEvent(data: IAirdropEvent): Promise<IAirdropEvent> {
		const airdropEvent = await AirdropEvent.create(data);
		return airdropEvent;
	}

	async getActiveAirdrop(): Promise<IAirdropEvent | null> {
		const now = new Date();
		return await AirdropEvent.findOne({
			startTime: { $lte: now },
			endTime: { $gte: now },
			isActive: true,
		});
	}
	async getActiveAirdropByAridropId(
		airdropId: Schema.Types.ObjectId
	): Promise<IAirdropEvent | null> {
		const now = new Date();
		return await AirdropEvent.findOne({
			startTime: { $lte: now },
			endTime: { $gte: now },
			isActive: true,
			_id: airdropId,
		});
	}
	async getPendingAirdropClaims(): Promise<IAirdropClaimLog[]> {
		const claims = await airdropClaimLogModel
			.find({ status: "pending" })
			.populate("userId", "name email")
			.populate("airdropId", "name conversionRate startTime");

		return claims;
	}
	async findAirdropClaimLogById(
		id: Schema.Types.ObjectId
	): Promise<IAirdropClaimLog | null> {
		return await airdropClaimLogModel.findById(id);
	}
	async hasUserClaimed(
		userId: Schema.Types.ObjectId,
		airdropId: Schema.Types.ObjectId
	): Promise<boolean> {
		const result = await InGameCoinTransactions.exists({ userId, airdropId });
		return !!result;
	}

	async getClaimsByAirdropId({ airdropId, status, page = 1, limit = 10, }: GetClaimsParams): Promise<any> {
		const filters: any = {
			airdropId,
		};

		if (status) {
			filters.status = status;
		}

		const skip = (page - 1) * limit;

		const [claims, total] = await Promise.all([
			airdropClaimLogModel.find(filters)
				.populate("userId", "name email avatarUrl")
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.lean(),

			airdropClaimLogModel.countDocuments(filters),
		]);
		const claimRequests = claims.map((item: any) => {
			return {
				user: {
					id: item.userId?._id,
					name: item.userId.name,
					email: item.userId.email,
					avatarUrl: item.userId.avatarUrl
				},
				airdropId: item.airdropId,
				lootPointsClaimed: item.lootPointsClaimed,
				coinsReceived: item.coinsReceived,
				currency: item.currency,
				adminNote: item.adminNote || "",
				status: item.status,
				approvedAt: item.approvedAt,
				rejectedAt: item.rejectedAt,
				createdAt: item.createdAt,

			}
		})
		return { claims: claimRequests, total };
	};
	async getAirdropEventById(id: string): Promise<IAirdropEvent | null> {
		return await AirdropEvent.findById(id);
	}
	async getUserInGameWallet(
		userId: Schema.Types.ObjectId
	): Promise<IWallet | null> {
		return await InGameCoinWallet.findOne({ userId });
	}
	async updateAirdropEvent(
		id: string,
		data: Partial<IAirdropEvent>
	): Promise<IAirdropEvent | null> {
		return await AirdropEvent.findByIdAndUpdate(id, data, { new: true });
	}

	async deleteAirdropEvent(id: string): Promise<void> {
		const deletedAirdrop = await AirdropEvent.findByIdAndDelete(id);
		if (!deletedAirdrop) throw new Error("Airdrop Event does not exist");
	}
	async getAllAirdropEvents(query: { page?: string, limit?: string, search?: string, sort?: string }): Promise<{ airdropEvents: IAirdropEvent[]; total: number }> {

		const page = Number(query?.page) || 1;
		const limit = Number(query?.limit) || 10;
		const skip = (page - 1) * limit;

		let sortBy: Record<string, 1 | -1> = { createdAt: -1 }; 
		if (query.sort == "1") {
			sortBy = { createdAt: 1 };
		} else if (query.sort == "-1") {
			sortBy = { createdAt: -1 };
		}

		let filterBy: any = {};
		if (query.search) {
			const regex = new RegExp(query.search, "i");
			filterBy.$or = [
				{ name: { $regex: regex } },
				{ description: { $regex: regex } },
			];
		}

		const [airdropEvents, total] = await Promise.all([
			AirdropEvent.find(filterBy)
				.skip(skip)
				.limit(limit)
				.sort(sortBy)
				.lean(),

			AirdropEvent.countDocuments(filterBy)
		]);

		return { airdropEvents, total };
	}

}
