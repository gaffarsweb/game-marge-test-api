import { Schema, SortOrder } from "mongoose";
import InGameCoinTransactions from "../models/inGameCoinTransations.model";
import InGameCoinWallet from "../models/inGameCoinWallet.model";
import spinCombinationModel, { ISpinCombination } from "../models/spinCombination.model";
import { SpinHistory } from "../models/spinHistory.model";
import User from "../models/user.model";
import Wallet from "../models/wallet.model";
import Settings from "../models/setting.model";
import { logger } from "../utils/logger";
import Transaction from "../models/transaction.model";
import { transactionStatus, transactionType } from "../utils/enums";

export class SpinRepository {


	async spin(userId: Schema.Types.ObjectId, spinFee: number): Promise<number> {
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");
		const setting = await Settings.findOne();
		if (!setting) throw new Error("Settings not found");
		if (setting.spinLimit === user.currentSpinCount) throw new Error("Spin limit reached");
		const userWallet = await InGameCoinWallet.findOne({ userId: userId });
		if (!userWallet) throw new Error("Wallet not found");
		if (userWallet.balance < spinFee) throw new Error("Insufficient balance");
		user.currentSpinCount += 1;
		userWallet.balance -= spinFee;
		const remainingSpins = setting.spinLimit - user.currentSpinCount;
		await user.save();
		await userWallet.save();
		await InGameCoinTransactions.create({
			userId: userId,
			type: "DEBITED",
			amount: spinFee,
			description: "Spin fee",
			title:"Spin fee"
		})
		return remainingSpins;
	}

	async rewardUser(userId: Schema.Types.ObjectId, combination: string[], spinFee: number): Promise<any> {
		const rewardConfig = await spinCombinationModel.findOne({ combination });
		if (!rewardConfig) throw new Error("Reward configuration not found");
		const rewardAmount = rewardConfig.rewardAmount;
		const rewardType = rewardConfig.rewardType;
		const network = rewardConfig.network;
		if (rewardType !== "LOOT") {
			const wallet = await Wallet.findOne({ userId });
			if (!wallet) throw new Error("Wallet not found");
			const coin = wallet.balances.find((bal) => bal.currency === rewardType && bal.network === network);
			if (coin) {
				coin.availableBalance += rewardAmount;
			} else {
				wallet.balances.push({
					currency: "tGMG",
					balance: 0,
					availableBalance: rewardAmount,
					network: "GMG Testnet",
				});
			}
			await wallet.save();
			await Transaction.create({
				userId: userId,
				transactionAmount:rewardAmount,
				transactionStatus:transactionStatus.SUCCESS,
				transactionType:transactionType.reward,
				currency: rewardType,
				network: network,
				remarks: `You have recieved this amount via spin reward`,
				
			})
		} else {
			const userWallet = await InGameCoinWallet.findOne({ userId });
			if (!userWallet) throw new Error("Wallet not found");
			userWallet.balance += rewardAmount;
			await userWallet.save();
			await InGameCoinTransactions.create({
				userId: userId,
				type: "CREDITED",
				amount: rewardAmount,
				description: `You have recieved ${rewardAmount} ${rewardType}`,
				title: "Spin reward"
			})

		}
		return {rewardType, rewardAmount};
	}

	async createSpinCombinations(combinations: ISpinCombination[]): Promise<ISpinCombination[]> {
		return await spinCombinationModel.insertMany(combinations);

	}
	async updateSpinCombination(combinationId: Schema.Types.ObjectId, combination: ISpinCombination): Promise<ISpinCombination> {
		const updatedCombination = await spinCombinationModel.findByIdAndUpdate(combinationId, combination, { new: true });
		if (!updatedCombination) throw new Error("Combination not found");
		return updatedCombination;
	}
	async getSpinCombinations(): Promise<ISpinCombination[]> {
		return await spinCombinationModel.find();
	}
	async getSpinCombination(combinationId: Schema.Types.ObjectId): Promise<ISpinCombination> {
		const combination = await spinCombinationModel.findById(combinationId);
		if (!combination) throw new Error("Combination not found");
		return combination;
	}

	async getSpinHistory(query: { page?: string, limit?: string, sort?: string, search?: string, filter?: string, startDate?: string, endDate?: string  }): Promise<any> {
		try {
			const page = query.page ? parseInt(query.page, 10) : 1;
			const limit = query.limit ? parseInt(query.limit, 10) : 10;
			const sortOrder = query.sort ? Number(query.sort) : -1;
			const search = query.search ?? '';
			const filter = query.filter ? JSON.parse(query.filter) : {};
			const searchCondition = search
				? {
					$or: [
						{ "userData.name": { $regex: search, $options: "i" } } 
					]
				}
				: {};
				if (query.startDate && query.endDate) {
					const startDate = new Date(query.startDate);
					const endDate = new Date(query.endDate);
					// Include the entire end date by setting the time to the end of the day
					endDate.setHours(23, 59, 59, 999);

					filter.createdAt = {
							$gte: startDate,
							$lte: endDate,
					};
			}
			const whereCondition = {
				...filter,
				...searchCondition
			};

			const aggregationPipeline: any[] = [
				{
					$lookup: {
						from: 'users', 
						localField: 'userId',
						foreignField: '_id',
						as: 'userData'
					}
				},
				{ $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } }, 
				
			];

			aggregationPipeline.push(
				{ $match: whereCondition },
				{
					$project: {
						name: 1,
						combination: 1,
						rewardType: 1,
						rewardAmount: 1,
						spinFee: 1,
						userId: 1,
						createdAt: 1,
						"userData.name": 1,
						"userData.email": 1,
						"userData.avatarUrl": 1
					}
				},
				{ $sort: { createdAt: sortOrder as SortOrder } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit }

			)

			const combination = await SpinHistory.aggregate(aggregationPipeline);

			if (combination.length === 0) {
				return {
					status: false,
					code: 404,
					msg: "Spin history not found"
				};
			}

			const totalResult = await SpinHistory.countDocuments(whereCondition);

			return {
				status: true,
				code: 200,
				data: {
					spinHistory: combination,
					page: page,
					limit: limit,
					totalResult: totalResult
				}
			};
		} catch (error) {
			logger.error('Error fetching spin history:', error);
			return {
				status: false,
				code: 500,
				msg: error instanceof Error ? error.message : 'Internal server error'
			};
		}
	}




	async deleteSpinCombination(combinationId: Schema.Types.ObjectId): Promise<ISpinCombination> {
		const deletedCombination = await spinCombinationModel.findByIdAndDelete(combinationId);
		if (!deletedCombination) throw new Error("Combination not found");
		return deletedCombination;
	}
	async getSpinFee(userId: Schema.Types.ObjectId): Promise<{ spinFee: number, spinLimit: number, remainingSpins: number }> {
		const setting = await Settings.findOne();
		if (!setting) throw new Error("Spin fee not found");
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");
		return { spinFee: setting.spinFee, spinLimit: setting.spinLimit, remainingSpins: setting.spinLimit - user.currentSpinCount };
	}
}
