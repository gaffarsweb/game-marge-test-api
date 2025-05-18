import mongoose, { PipelineStage, Schema, SortOrder, Types } from "mongoose";
import { GetTournamentsParams, ITournamentRepository } from "../interfaces/tournament.interface";
import Tournament, { ITournament } from "../models/tournament.model";
import tournamentParticipationModel from "../models/tournamentParticipation.model";
import tournamentModel from "../models/tournament.model";
import { get } from "mongoose";
import userModel from "../models/user.model";

export class TournamentRepository implements ITournamentRepository {
	async createTournament(tournament: ITournament): Promise<ITournament> {
		const newTournament = await Tournament.create(tournament);
		return newTournament;
	}

	async getTournamentById(id: Schema.Types.ObjectId): Promise<ITournament | null> {
		return await Tournament.findById(id)
	}

	async updateTournament(id: Schema.Types.ObjectId, tournament: Partial<ITournament>): Promise<ITournament | null> {
		const updatedTournament = await Tournament.findByIdAndUpdate(id, tournament, { new: true });
		if (!updatedTournament) {
			throw new Error("Tournament not found");
		}
		return updatedTournament;
	}

	async deleteTournament(id: Schema.Types.ObjectId): Promise<void> {
		const deletedTournament = await Tournament.findByIdAndDelete(id);
		if (!deletedTournament) {
			throw new Error("Tournament not found");
		}
		return;
	}

	async getAllTournamentsForApp(query: any): Promise<{ tournaments: ITournament[], total: number }> {
		// const filters: any = {
		// 	gameId,
		// };

		// if (status) {
		// 	filters.status = status;
		// }

		const [tournaments, total] = await Promise.all([
			Tournament.find(query)
				.sort({ createdAt: -1 })
				.lean(),

			Tournament.countDocuments(query),
		]);
		return { tournaments, total };
	}

	async getAllTournaments({
		page = 1,
		limit = 10,
		search = "",
		sort = "",
		filter = "{}",
		startDate = "",
		endDate = "",
		selectedCurrency = "",
	}: Partial<GetTournamentsParams>): Promise<{ tournaments: ITournament[]; total: number }> {
		const filters: any = {};

		// Parse and apply filters
		if (filter && filter !== "{}") {
			try {
				const parsedFilter = typeof filter === "string" ? JSON.parse(filter) : {};
				Object.assign(filters, parsedFilter);
			} catch (err) {
				console.warn("Invalid filter JSON:", err);
			}
		}
		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			end.setHours(23, 59, 59, 999); // Include the entire end date
			filters.createdAt = {
				$gte: start,
				$lte: end
			};
		}
		if (selectedCurrency && selectedCurrency !== "all") {
			filters.currency = selectedCurrency;
		}

		if (search) {
			const regex = new RegExp(search, "i");
			filters.$or = [
				{ name: { $regex: regex } },
				{ network: { $regex: regex } },
			];
		}

		let sortBy: Record<string, 1 | -1> = {};
		if (sort === "1") {
			sortBy.createdAt = 1;
		} else if (sort === "-1") {
			sortBy.createdAt = -1;
		}

		const parsedLimit = Number(limit) || 10;
		const parsedPage = Number(page) || 1;
		const skip = (parsedPage - 1) * parsedLimit;

		const pipeline = [
			{ $match: filters },
			{
				$lookup: {
					from: "games",
					localField: "gameId",
					foreignField: "_id",
					as: "gameDetails"
				}
			},
			{ $unwind: { path: "$gameDetails", preserveNullAndEmptyArrays: true } },
			{
				$addFields: {
					gameDetails: {
						name: "$gameDetails.name",
						imgUrl: "$gameDetails.imgUrl"
					}
				}
			},
			{ $sort: sortBy },
			{ $skip: skip },
			{ $limit: parsedLimit }
		];

		const [tournaments, totalCountResult] = await Promise.all([
			Tournament.aggregate(pipeline),
			Tournament.countDocuments(filters)
		]);

		return {
			tournaments,
			total: totalCountResult
		};
	}


	async getTournamentDetailsById(tournamentId: string, userId: string): Promise<any> {
		const tournament = await tournamentModel.findById(tournamentId).lean();
		if (!tournament) throw new Error("Tournament not found");

		const totalParticipants = await tournamentParticipationModel.countDocuments({ tournamentId });

		// Step 1: Get highest score per user (best only)
		const bestScores = await tournamentParticipationModel.aggregate([
			{ $match: { tournamentId: new Types.ObjectId(tournamentId) } },
			{ $sort: { score: -1, createdAt: 1 } },
			{
				$group: {
					_id: "$userId",
					score: { $first: "$score" },
					participationId: { $first: "$_id" },
					createdAt: { $first: "$createdAt" }
				}
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user"
				}
			},
			{ $unwind: "$user" },
			{
				$project: {
					userId: "$_id",
					_id: "$participationId",
					username: { $ifNull: ["$user.name", "Unknown"] },
					avatar: {
						$ifNull: ["$user.avatarUrl", "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"]
					},
					score: 1,
					createdAt: 1
				}
			},
			{ $sort: { score: -1 } }
		]);

		// Step 2: Assign ranks and identify logged-in user's best score
		let leaderboard: any[] = [];
		let userBestEntry: any = null;
		let rank = 1;

		for (const entry of bestScores) {
			const rewardObj = tournament.rewardDistribution?.find(r => r.position === rank);
			const item = {
				...entry,
				rank,
				reward: rewardObj?.amount || 0
			};

			leaderboard.push(item);

			if (entry.userId.toString() === userId.toString()) {
				userBestEntry = item;
			}

			rank++;
		}

		// Step 3: Get ALL participations of this user (sorted)
		const allUserParticipations = await tournamentParticipationModel.aggregate([
			{
				$match: {
					tournamentId: new Types.ObjectId(tournamentId),
					userId: new Types.ObjectId(userId)
				}
			},
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user"
				}
			},
			{ $unwind: "$user" },
			{
				$project: {
					_id: 1,
					userId: 1,
					score: 1,
					createdAt: 1,
					username: "$user.name",
					avatar: "$user.avatarUrl"
				}
			},
			{ $sort: { score: -1 } }
		]);
		// Step 4: Remove the best entry by participationId only
		const participationsWithoutBest = allUserParticipations
			.filter(p => userBestEntry && p._id.toString() !== userBestEntry._id.toString())
			.map(p => ({
				...p,
				rank: 0,
				reward: 0
			}));

		const allUserParticipationWithBest = userBestEntry
			? [userBestEntry, ...participationsWithoutBest]
			: participationsWithoutBest;

		return {
			tournament: {
				id: tournament._id,
				name: tournament.name,
				bannerImage: tournament.bannerImage,
				startTime: tournament.startTime,
				endTime: tournament.endTime,
				entryFee: tournament.entryFee,
				currency: tournament.currency,
				rewardDistribution: tournament.rewardDistribution
			},
			registeredPlayers: totalParticipants,
			leaderboard,
			user: {
				bestScore: userBestEntry?.score || 0,
				bestRank: userBestEntry?.rank || null,
				playedTimes: allUserParticipationWithBest.length,
				participations: allUserParticipationWithBest
			}
		};
	  }
		async getTournamentDetailsAdminById(tournamentId: string, userId: string): Promise<any> {
			const tournament = await tournamentModel.findById(tournamentId).lean();
			if (!tournament) throw new Error("Tournament not found");
			
			const totalParticipants = await tournamentParticipationModel.countDocuments({ tournamentId });
			
			// Step 1: Get highest score per user (best only)
			const bestScores = await tournamentParticipationModel.aggregate([
				{ $match: { tournamentId: new Types.ObjectId(tournamentId) } },
				{ $sort: { score: -1, createdAt: 1 } },
				{
				$group: {
					_id: "$userId",
					score: { $first: "$score" },
					participationId: { $first: "$_id" },
					createdAt: { $first: "$createdAt" }
				}
				},
				{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user"
				}
				},
				{ $unwind: "$user" },
				{
				$project: {
					userId: "$_id",
					_id: "$participationId",
					username: { $ifNull: ["$user.name", "Unknown"] },
					email: { $ifNull: ["$user.email", "No Email"] },
					avatar: {
					$ifNull: ["$user.avatarUrl", "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"]
					},
					score: 1,
					createdAt: 1
				}
				},
				{ $sort: { score: -1 } }
			]);
			
			// Step 2: Assign ranks and identify logged-in user's best score
			let leaderboard: any[] = [];
			let userBestEntry: any = null;
			let rank = 1;
			
			for (const entry of bestScores) {
				const rewardObj = tournament.rewardDistribution?.find(r => r.position === rank);
				const item = {
				...entry,
				rank,
				reward: rewardObj?.amount || 0
				};
			
				leaderboard.push(item);
			
				if (entry.userId.toString() === userId.toString()) {
				userBestEntry = item;
				}
			
				rank++;
			}
			
			// Step 3: Get ALL participations of this user (sorted)
			const allUserParticipations = await tournamentParticipationModel.aggregate([
				{
				$match: {
					tournamentId: new Types.ObjectId(tournamentId),
					userId: new Types.ObjectId(userId)
				}
				},
				{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user"
				}
				},
				{ $unwind: "$user" },
				{
				$project: {
					_id: 1,
					userId: 1,
					score: 1,
					createdAt: 1,
					username: "$user.name",
					email: "$user.email",
					avatar: "$user.avatarUrl"
				}
				},
				{ $sort: { score: -1 } }
			]);
			// Step 4: Remove the best entry by participationId only
			const participationsWithoutBest = allUserParticipations
				.filter(p => userBestEntry && p._id.toString() !== userBestEntry._id.toString())
				.map(p => ({
				...p,
				rank: 0,
				reward: 0
				}));
			
			const allUserParticipationWithBest = userBestEntry
				? [userBestEntry, ...participationsWithoutBest]
				: participationsWithoutBest;
			
			return {
				tournament: {
				id: tournament._id,
				name: tournament.name,
				bannerImage: tournament.bannerImage,
				startTime: tournament.startTime,
				endTime: tournament.endTime,
				entryFee: tournament.entryFee,
				currency: tournament.currency,
				rewardDistribution: tournament.rewardDistribution
				},
				registeredPlayers: totalParticipants,
				leaderboard,
				user: {
				bestScore: userBestEntry?.score || 0,
				bestRank: userBestEntry?.rank || null,
				playedTimes: allUserParticipationWithBest.length,
				participations: allUserParticipationWithBest
				}
			};
			}
	  
	async getTournamentDetailsForAdmin(
		tournamentId: string,
		query: {
			page?: number;
			limit?: number;
			email?: string;
			sortBy?: string;
			order?: "asc" | "desc";
		}
	): Promise<any> {
		const page = Number(query.page) || 1;
		const limit = Number(query.limit) || 25;
		const skip = (page - 1) * limit;

		const tournament: any = await Tournament.findById(tournamentId).populate("gameId", "name").lean();
		if (!tournament) throw new Error("Tournament not found");

		let userFilter: any = {};
		if (query.email) {
			const users = await userModel.find({
				email: { $regex: query.email, $options: "i" }
			}).select("_id").lean();
			const userIds = users.map((u) => u._id);
			userFilter.userId = { $in: userIds };
		}

		const match: any = {
			tournamentId: new Types.ObjectId(tournamentId),
			...userFilter
		};

		const leaderboardRaw = await tournamentParticipationModel.aggregate([
			{ $match: match },
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user"
				}
			},
			{ $unwind: "$user" },
			{
				$project: {
					_id: 1,
					userId: "$user._id",
					name: "$user.name",
					email: "$user.email",
					avatar: "$user.avatarUrl",
					score: 1,
					timePlayed: 1,
					entryAt: 1,
					createdAt: 1
				}
			},
			{ $sort: { [query.sortBy || "score"]: query.order === "asc" ? 1 : -1 } },
			{ $skip: skip },
			{ $limit: limit }
		]);

		const totalEntries = await tournamentParticipationModel.countDocuments(match);

		leaderboardRaw.forEach((entry, index) => {
			entry.rank = skip + index + 1;
		});

		return {
			tournament: {
				id: tournament._id,
				name: tournament.gameId.name,
				game: tournament.name,
				startTime: tournament.startTime,
				endTime: tournament.endTime,
				entryFee: tournament.entryFee,
				currency: tournament.currency,
				status: tournament.status,
				isRewarded: tournament.isRewarded,
				totalParticipants: await tournamentParticipationModel.countDocuments({ tournamentId }),
				rewardDistribution: tournament.rewardDistribution
			},
			leaderboard: leaderboardRaw,
			pagination: {
				page,
				limit,
				totalEntries
			}
		};
	}

	async getTournamentParticipations(
		tournamentId: string,
		query: { page?: number; limit?: number; search?: string; sort?: string }
	): Promise<any> {
		const page = Number(query.page) || 1;
		const limit = Number(query.limit) || 10;
		const skip = (page - 1) * limit;
		const search = query.search?.trim();

		let sortBy: Record<string, 1 | -1> = {};
		switch (query.sort) {
			case "newest":
				sortBy.createdAt = -1;
				break;
			case "oldest":
				sortBy.createdAt = 1;
				break;
			case "highest":
				sortBy.score = -1;
				break;
			case "lowest":
				sortBy.score = 1;
				break;
			default:
				sortBy.createdAt = -1;
				break;
		}

		const tournament: any = await Tournament.findById(tournamentId)
			.populate("gameId", "name")
			.lean();

		if (!tournament) {
			return {
				statusCode: 404,
				message: "Tournament not found",
				data: "Tournament not found",
			};
		}

		const matchStage: any = {
			tournamentId: new Types.ObjectId(tournamentId),
		};

		const escapeRegex = (str: string) =>
			str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

		const searchString = query.search?.trim().replace(/^"|"$/g, "");
		const searchRegex = searchString
			? new RegExp(escapeRegex(searchString), "i")
			: null;

		const rankingPipeline: any[] = [
			{ $match: matchStage },
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$sort: { score: -1 },
			},
			{
				$project: {
					_id: 1,
					userId: "$user._id",
					name: "$user.name",
					email: "$user.email",
					avatarUrl: "$user.avatarUrl",
					score: 1,
				},
			},
		];

		const rankedByScore = await tournamentParticipationModel.aggregate(rankingPipeline);

		const rankMap = new Map<string, number>();
		rankedByScore.forEach((user, index) => {
			rankMap.set(user._id.toString(), index + 1);
		});

		const pipeline: any[] = [
			{ $match: matchStage },
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
		];

		if (searchRegex) {
			pipeline.push({
				$match: {
					$or: [
						{ "user.name": { $regex: searchRegex } },
						{ "user.email": { $regex: searchRegex } },
					],
				},
			});
		}

		pipeline.push(
			{ $sort: sortBy },
			{
				$project: {
					_id: 1,
					userId: "$user._id",
					name: "$user.name",
					email: "$user.email",
					avatarUrl: "$user.avatarUrl",
					score: 1,
					timePlayed: 1,
					entryAt: 1,
					createdAt: 1,
				},
			}
		);

		const filteredResults = await tournamentParticipationModel.aggregate(pipeline);

		const resultsWithRank = filteredResults.map(user => ({
			...user,
			rank: rankMap.get(user._id.toString()) || null,
		}));

		const totalResults = resultsWithRank.length;
		const paginatedResults = resultsWithRank.slice(skip, skip + limit);

		return {
			page,
			limit,
			totalResults,
			totalPages: Math.ceil(totalResults / limit),
			results: paginatedResults,
		};
	}

	async getTournamentWithoutPage(): Promise<{ tournaments: ITournament[] }> {

		const pipeline = [
			{ $match: { status: 'ongoing' } },
			{
				$lookup: {
					from: "games",
					localField: "gameId",
					foreignField: "_id",
					as: "gameDetails"
				}
			},
			{ $unwind: { path: "$gameDetails", preserveNullAndEmptyArrays: true } },
			{
				$addFields: {
					gameDetails: {
						name: "$gameDetails.name",
						imgUrl: "$gameDetails.imgUrl"
					}
				}
			},
			{
				$project: {
					_id: 1,
					name: 1
				}
			}
		];

		const [tournaments] = await Promise.all([
			Tournament.aggregate(pipeline),
		]);

		return {
			tournaments,
		};
	}

	async getTournamentsByGameId({
		gameId,
		page,
		limit,
		sort,
		search,
		selectedCurrency,
	}: {
		gameId: string;
		page: number;
		limit: number;
		sort: string;
		search: string;
		selectedCurrency?: string;
	}): Promise<{ tournaments: ITournament[]; total: number }> {

		if (!mongoose.Types.ObjectId.isValid(gameId)) {
			throw new Error("Invalid gameId");
		}

		const matchStage: PipelineStage.Match = {
			$match: {
				gameId: new mongoose.Types.ObjectId(gameId),
				...(search && {
					$or: [
						{ name: { $regex: new RegExp(search, "i") } },
						{ network: { $regex: new RegExp(search, "i") } },
						{ currency: { $regex: new RegExp(search, "i") } },
					],
				}),
				...(selectedCurrency && selectedCurrency !== "all" && {
					currency: selectedCurrency,
			}),
			},
		};

		const sortValue = parseInt(sort, 10);
		const sortDirection: 1 | -1 = sortValue === 1 ? 1 : -1;

		const sortStage: PipelineStage.Sort = {
			$sort: {
				createdAt: sortDirection,
			},
		};

		const skipStage: PipelineStage.Skip = { $skip: (page - 1) * limit };
		const limitStage: PipelineStage.Limit = { $limit: limit };

		const pipeline: PipelineStage[] = [
			matchStage,
			{
				$facet: {
					tournaments: [sortStage, skipStage, limitStage],
					total: [{ $count: "count" }],
				},
			},
		];

		const [result] = await Tournament.aggregate(pipeline);

		const tournaments = result?.tournaments || [];
		const total = result?.total?.[0]?.count || 0;

		return { tournaments, total };
	}



}