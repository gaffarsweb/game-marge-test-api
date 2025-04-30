import mongoose, { Schema } from "mongoose";
import referralHistory from "../models/referralHistory.model";

export class referralRepository {

	async getReferralHistory(userId: any): Promise<any> {

		let result = await referralHistory.find({ referredBy: userId })
			.populate({
				path: "referredTo",
				select: "-password -referralCode -otp -otpExpiredAt -playedPracticeGame -refreshToken -__v -updatedAt"
			});

		return result;

	}
	async getReferralListByUserId(query: any, userId: Schema.Types.ObjectId): Promise<any> {
		const { page = 1, limit = 10, sort = -1, search } = query;
		const skip = (page - 1) * limit;
		let queryPaload: any = { referredBy: userId };
		if (search) {
			queryPaload.$or = [
				{ title: { $regex: new RegExp(search, "i") } },
				{ description: { $regex: new RegExp(search, "i") } } // Search in description
			];
		}
		let result = await referralHistory.find(queryPaload).sort({ "_id": sort }).skip(skip).limit(limit)
			.populate({
				path: "referredBy",
				select: "-password -referralCode -otp -otpExpiredAt -playedPracticeGame -refreshToken -__v -updatedAt"
			})
			.populate({
				path: "referredTo",
				select: "-password -referralCode -otp -otpExpiredAt -playedPracticeGame -refreshToken -__v -updatedAt"
			});

		return result;

	}
	async getAllReferralHistory(query: any): Promise<any> {
		const { page = 1, limit = 10, sort = -1, search } = query;
		const skip = (page - 1) * limit;

		const matchStage: any = {};

		if (search) {
			const regex = new RegExp(search, 'i');
			matchStage.$or = [
				{ 'referredBy.name': { $regex: regex } },
				{ 'referredTo.name': { $regex: regex } }
			];
		}

		const pipeline: any[] = [];

		pipeline.push(
			{
				$lookup: {
					from: 'users',
					localField: 'referredBy',
					foreignField: '_id',
					as: 'referredBy',
				},
			},
			{
				$unwind: {
					path: '$referredBy',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'referredTo',
					foreignField: '_id',
					as: 'referredTo',
				},
			},
			{
				$unwind: {
					path: '$referredTo',
					preserveNullAndEmptyArrays: true,
				},
			}
		);

		if (Object.keys(matchStage).length > 0) {
			pipeline.push({ $match: matchStage });
		}

		pipeline.push(
			{
				$project: {
					title: 1,
					description: 1,
					currency: 1,
					balance: 1,
					createdAt: 1,
					'referredBy._id': 1,
					'referredBy.name': 1,
					'referredBy.email': 1, 
					'referredBy.isEmailVerified': 1, 
					'referredBy.country': 1, 
					'referredBy.referredBy': 1, 
					'referredBy.avatarUrl': 1,
					'referredBy.earnedCoins': 1,
					'referredBy.provider': 1,
					'referredBy.role': 1,
					'referredBy.isActive': 1,
					'referredBy.totalReferrals': 1,
					'referredTo._id': 1,
					'referredTo.country': 1,
					'referredTo.isEmailVerified': 1,
					'referredTo.role': 1,
					'referredTo.earnedCoins': 1,
					'referredTo.provider': 1,
					'referredTo.referredBy': 1,
					'referredTo.totalReferrals': 1,
					'referredTo.isActive': 1,
					'referredTo.name': 1,
					'referredTo.email': 1,
					'referredTo.avatarUrl': 1
				},
			},
			{ $sort: { createdAt: Number(sort) } },
			{ $skip: Number(skip) },
			{ $limit: Number(limit) }
		);


		const result = await referralHistory.aggregate(pipeline);

		const countMatchPipeline = [];
		if (Object.keys(matchStage).length > 0) {
			countMatchPipeline.push({ $match: matchStage });
		}
		countMatchPipeline.push({ $count: 'total' });

		const countResult = await referralHistory.aggregate(countMatchPipeline);
		const total = countResult[0]?.total || 0;

		return {
			status: true,
			code: 200,
			data: {
				result,
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit),
			},
		};
	}

}