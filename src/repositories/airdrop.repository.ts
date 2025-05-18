import AirdropCampaign from "../models/airdrop.model";
import dayjs from "dayjs";
import InGameCoinTransactions from "../models/inGameCoinTransations.model";
import InGameCoinWallet from "../models/inGameCoinWallet.model";
import { AirdropTaskCompletion } from "../models/airdropaTaskCompletion.model";
import { Schema, Types } from "mongoose";

export class AirdropRepository {
	async createAirdrop(data: any): Promise<any> {
		return await AirdropCampaign.create(data);
	}

	async getAllAirdrops(query: any): Promise<any> {
		const { page = 1, limit = 10, search, sort, filter } = query;
		const skip = (page - 1) * limit;

		let sortBy: any = {}
		if (sort === "1") {
			sortBy.createdAt = 1
		} else if (sort === "-1") {
			sortBy.createdAt = -1
		}

		let filterBy: any = {}
		if (search) {
			let regex = new RegExp(search, "i");
			filterBy.$or = [
				{ title: { $regex: regex } },
				{ description: { $regex: regex } },
			]
		}

		if(filter === "active"){
			filterBy.isActive = true
		}else if(filter === "inactive"){
			filterBy.isActive = false
		}

		const result = await AirdropCampaign.find(filterBy)
			.sort(sortBy)
			.skip(skip)
			.limit(limit);
		const count = await AirdropCampaign.countDocuments(filterBy);
		return { result, count };
	}

	async updateAirdrop(id: string, data: any): Promise<any> {
		const updatedAirdrop = await AirdropCampaign.findByIdAndUpdate(id, data, { new: true });
		if (!updatedAirdrop) throw new Error("Airdrop not found");
		return updatedAirdrop;
	}

	async delete(id: string): Promise<any> {
		const deleteAirdro = await AirdropCampaign.findByIdAndDelete(id);
		if (!deleteAirdro) throw new Error("Airdrop not found");
		return;
	}

	async getActiveAirdrops() {
		const airdrops = await AirdropCampaign.find({
			isActive: true,
			endAt: { $gte: new Date() }
		}).sort({ createdAt: -1 }).lean().select("-__v -tasks");

		const now = dayjs();

		const enriched = airdrops.map(drop => ({
			...drop,
			daysLeft: Math.max(0, dayjs(drop.endAt).diff(now, "day"))
		}));

		return enriched;
	}

	async getAirdropById(userId: Schema.Types.ObjectId, id: string): Promise<any> {
		const airdrop = await AirdropCampaign.findById(id).lean();
		if (!airdrop) throw new Error("Airdrop not found");

		const now = dayjs();
		const daysLeft = Math.max(0, dayjs(airdrop.endAt).diff(now, "day"));

		// Fetch completed task indexes by user for this campaign
		const completions = await AirdropTaskCompletion.find({
			userId,
			campaignId: new Types.ObjectId(id)
		}).lean();

		const completedIndexes = new Set(completions.map(item => item.taskIndex));

		// Attach isClaimed flag to tasks
		const tasks = airdrop.tasks.map((task, index) => ({
			...task,
			isClaimed: completedIndexes.has(index)
		}));

		return {
			...airdrop,
			daysLeft,
			tasks
		};
	}

	async claimTaskReward(userId: string, campaignId: string, taskIndex: number) {
		const already = await AirdropTaskCompletion.findOne({ userId, campaignId, taskIndex });
		if (already) throw new Error("Task already claimed");
		const campaign = await AirdropCampaign.findById(campaignId);
		if (!campaign || !campaign.tasks[taskIndex]) throw new Error("Invalid task");

		const task = campaign.tasks[taskIndex];

		//  1. Credit to in-game wallet
		let wallet = await InGameCoinWallet.findOne({ userId });
		if (!wallet) {
			wallet = await InGameCoinWallet.create({ userId, balance: task.reward });
		} else {
			wallet.balance = Number(wallet.balance) + task.reward;
			await wallet.save();
		}

		//  2. Log transaction
		await InGameCoinTransactions.create({
			userId,
			title:"Airdrop task reward",
			type: "CREDITED",
			description: `Airdrop task reward: ${task.title}`,
			amount: task.reward,
		});

		// 3. Mark task as claimed
		await AirdropTaskCompletion.create({ userId, campaignId, taskIndex });

		return {
			message: "Reward claimed",
			reward: task.reward,
			task: task.title,
		};
	}
	async getUserCompletedTasks(userId: string, campaignId: string) {
		const completed = await AirdropTaskCompletion.find({ userId, campaignId });
		return completed.map((c: any) => c.taskIndex);
	}


	async getAirdropWithoutPage(): Promise<any> {
		const result = await AirdropCampaign.find().select('title _id')
		return { result };
	}
}