import { Schema, Types } from "mongoose";
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

	async getAllTournamentsForApp(query:any): Promise<{ tournaments: ITournament[], total: number }> {
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
	
	
	async getTournamentDetailsById(tournamentId: string, userId: Schema.Types.ObjectId): Promise<any> {
		const tournament = await tournamentModel.findById(tournamentId).lean();
		if (!tournament) throw new Error("Tournament not found");
	  
		const totalParticipants = await tournamentParticipationModel.countDocuments({ tournamentId });
	  
		// Get all participations (not grouped)
		const allParticipations = await tournamentParticipationModel.aggregate([
		  { $match: { tournamentId: new Types.ObjectId(tournamentId) } },
		  {
			$lookup: {
			  from: "users",
			  localField: "userId",
			  foreignField: "_id",
			  as: "user"
			}
		  },
		  { $unwind: "$user" },
		  { $sort: { score: -1 } },
		  {
			$project: {
			  _id: 1,
			  userId: 1,
			  username: { $ifNull: ["$user.name", "Unknown"] },
			  avatar: {
				$ifNull: ["$user.avatarUrl", "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"]
			  },
			  score: 1,
			  createdAt: 1
			}
		  }
		]);
	  
		// Assign ranks
		let currentRank = 1;
		const leaderboardWithRanks = allParticipations.map((entry) => {
		  const rewardObj = tournament.rewardDistribution?.find(r => r.position === currentRank);
		  return {
			rank: currentRank++,
			...entry,
			reward: rewardObj?.amount || 0
		  };
		});
	  
		//  Extract user-specific participations
		const userParticipations = leaderboardWithRanks.filter(entry => entry.userId.toString() === userId.toString());
	  
		// Leaderboard excluding the user
		const leaderboard = leaderboardWithRanks.filter(entry => entry.userId.toString() !== userId.toString());
	  
		const bestUserScore = userParticipations.length > 0 ? userParticipations[0].score : 0;
		const bestRank = userParticipations.length > 0 ? userParticipations[0].rank : null;
	  
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
		  leaderboard, // Excludes logged-in user
		  user: {
			playedTimes: userParticipations.length,
			bestScore: bestUserScore,
			bestRank,
			participations: userParticipations
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

	async getTournamentWithoutPage(): Promise<{ tournaments: ITournament[]}> {
	
		const pipeline = [
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

}