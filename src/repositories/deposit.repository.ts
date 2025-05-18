import { Schema, SortOrder } from "mongoose";
import Deposit from "../models/deposit.model";
import User from "../models/user.model";
import { logger } from "../utils/logger";
import { Request, Response } from 'express';
import dayjs from "dayjs";
import generateCSV from "../utils/export/generateCSV";
export class DepositRepository {
	async getAllDeposits(query: {
		page?: string;
		limit?: string;
		sort?: string;
		search?: string;
		filter?: string;
		isExport?: boolean
	}, res: Response): Promise<any> {
		try {
			const page = query.page ? parseInt(query.page, 10) : 1;
			const limit = query.limit ? parseInt(query.limit, 10) : 10;
			const sortOrder = query.sort ? Number(query.sort) : -1;
			const search = query.search ?? '';
			const filter = query.filter ? JSON.parse(query.filter) : {};

			let matchStage: any = {};

			if (filter?.date?.depositFrom && filter?.date?.depositTo) {
				const startDate = new Date(new Date(filter?.date?.depositFrom).setHours(0, 0, 0, 0));
				const endDate = new Date(new Date(filter?.date?.depositTo).setHours(23, 59, 59, 999));
				matchStage.createdAt = {
					$gte: startDate,
					$lte: endDate,
				}
			}

			if (filter?.currency) {
				matchStage.tokenSymbol = filter?.currency
			}

			if (search) {
				matchStage.$or = [
					{ "userData.name": { $regex: search, $options: "i" } },
					{ "userData.email": { $regex: search, $options: "i" } },
				]
			}

			console.log("Staged: ", matchStage)

			const aggregationPipeline: any[] = [
				{
					$lookup: {
						from: "users",
						localField: "userId",
						foreignField: "_id",
						as: "userData"
					}
				},
				{
					$unwind: {
						path: "$userData",
						preserveNullAndEmptyArrays: true
					}
				},
				{ $match: matchStage },
				{
					$project: {
						_id: 1,
						userId: 1,
						amount: 1,
						timeStamp: 1,
						blockNumber: 1,
						transactionHash: 1,
						from: 1,
						to: 1,
						tokenSymbol: 1,
						network: 1,
						txreceipt_status: 1,
						createdAt: 1,
						updatedAt: 1,
						"userData.name": { $ifNull: ["$userData.name", "N/A"] },
						"userData.email": { $ifNull: ["$userData.email", "N/A"] },
						"userData.avatarUrl": { $ifNull: ["$userData.avatarUrl", null] }
					}
				},
				{ $sort: { createdAt: sortOrder as SortOrder } },

			];

			const countPipeline = [...aggregationPipeline];
			countPipeline.push({ $count: 'total' })

			if (!query?.isExport) {
				aggregationPipeline.push(
					{ $skip: (page - 1) * limit },
					{ $limit: limit }
				)
			}

			const deposits = await Deposit.aggregate(aggregationPipeline);

			if (query?.isExport) {
				const headersMap: { [key: string]: string } = {
					"User Name": "User Name",
					"Email": "Email",
					"Avatar Url": "Avatar Url",
					"Currency": "Currency",
					"Network": "Network",
					"Amount": "Amount",
					"Date & Time": "Date & Time",
					"From": "From",
					"To": "To",
				};

				const plainRecords = deposits.map((deposit: any) => {
					const record: any = {
						"User Name": deposit?.userData?.name || "",
						"Email": deposit?.userData?.email || "",
						"Avatar Url": deposit?.userData?.avatarUrl,
						"Currency": deposit?.tokenSymbol || "",
						"Network": deposit?.network || "",
						"Amount": deposit?.amount,
						"Date & Time": dayjs(deposit?.createdAt).format("YYYY-MM-DD HH:mm:ss"),
						"From": deposit?.from,
						"To": deposit?.to,
					};

					return record;
				});

				const fileName = `deposits-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
				await generateCSV(plainRecords, headersMap, fileName, res);

				return {
					status: true,
					code: 200,
					data: "CSV file downloaded successfully"
				};

			}


			if (deposits.length === 0) {
				return {
					status: false,
					code: 404,
					msg: "Deposits not found"
				};
			}

			const countResult = await Deposit.aggregate(countPipeline);
			const totalResult = countResult[0]?.total || 0;
			const uniqueTokens = await Deposit.distinct("tokenSymbol");

			return {
				status: true,
				code: 200,
				data: {
					deposits,
					page,
					limit,
					totalResult,
					availableTokens: uniqueTokens
				}
			};
		} catch (error) {
			logger.error("Error in DepositRepository getAllDeposits:", error);
			return {
				status: false,
				code: 500,
				msg: error instanceof Error ? error.message : "Internal server error"
			};
		}
	}
}