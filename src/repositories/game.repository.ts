
import mongoose, { PipelineStage, Schema } from "mongoose";
import { IGamesRepository } from "../interfaces/game.interface";
import gameModel, { IGame } from "../models/game.model";
import GameResult from "../models/gameresult.model";
import { IPagination } from "../interfaces/news.interface";
import { SortOrder } from "mongoose";
import gameresultModel from "../models/gameresult.model";
import dayjs from "dayjs";
import { pipeline } from "stream";
import generateCSV from "../utils/export/generateCSV";
import { Request, Response } from "express";

export class GamesRepository implements IGamesRepository {
    async getAllGames(query: IPagination): Promise<{ data: any[]; count: number }> {
        const { page = 1, limit = 10, sort = 1, search = "" } = query;
        const numericSort = Number(sort);
        const validSort: SortOrder = numericSort === 1 || numericSort === -1 ? numericSort : 1;
        const skip = (page - 1) * limit;
        const sortOption: { [key: string]: SortOrder } = { createdAt: validSort };
        let filterBy: any = {}
        if (search) {
            let regex = new RegExp(search, "i");
            filterBy.$or = [
                { name: { $regex: regex } }
            ]
        }
        const data = await gameModel
            .find(filterBy)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
        const count = await gameModel.countDocuments();

        return { data, count };
    }

    async getAllGamesWithoutPagination(): Promise<{ data: any[] }> {

        const data = await gameModel.find().select("_id  name")
        return { data };
    }

    async getGameById(gameId: Schema.Types.ObjectId): Promise<any | null> {
        return await gameModel.findById(gameId);
    }
    async getGameGraphData(gameId: mongoose.Types.ObjectId, query: { startDate?: string; endDate?: string }): Promise<any | null> {
        const { startDate, endDate } = query;

        const start = dayjs(startDate).startOf("day");
        const end = dayjs(endDate).endOf("day");

        const matchFilter: Record<string, any> = {
            gameId: new mongoose.Types.ObjectId(gameId),
            createdAt: {
                $gte: start.toDate(),
                $lte: end.toDate(),
            },
        };

        const aggregationPipeline: PipelineStage[] = [
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                        },
                    },
                    matchCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ];

        try {
            const rawData = await gameresultModel.aggregate(aggregationPipeline);

            const result: Record<string, number> = {};
            let current = start.clone();

            while (current.isSameOrBefore(end)) {
                const dateKey = current.format("YYYY-MM-DD");
                result[dateKey] = 0;
                current = current.add(1, "day");
            }

            rawData.forEach((entry) => {
                result[entry._id] = entry.matchCount;
            });

            const finalResult = Object.keys(result).map((date) => ({
                date,
                matchCount: result[date],
            }));

            return finalResult;
        } catch (err) {
            console.error("Aggregation error:", err);
            throw err;
        }
    }


    async getGameByName(name: string): Promise<IGame | null> {
        return await gameModel.findOne({ name });
    }
    async createNewGame(payload: IGame): Promise<IGame> {
        return await gameModel.create(payload);
    }
    async updateGame(gameId: Schema.Types.ObjectId, payload: any): Promise<any> {
        return await gameModel.findByIdAndUpdate(gameId, payload, { new: true });
    }
    async deleteGame(gameId: Schema.Types.ObjectId): Promise<void> {
        await gameModel.findByIdAndDelete(gameId);
        return;

    }
    async getGameHistory(query: IPagination, res?: Response): Promise<any> {
        let { page = 1, limit = 10, sort = -1, search, filter, isExport } = query;

        let skip = (page - 1) * limit;

        let filterObj: any = {};
        try {
            if (filter && typeof filter === "string") {
                filterObj = JSON.parse(filter);
            }
        } catch (err) {
            console.warn("Invalid filter JSON", err);
        }

        const matchStage: any = {};
        if (filterObj?.isBotMatch === true) {
            matchStage.isBotMatch = true;
        } else if (filterObj?.isBotMatch === false) {
            matchStage.isBotMatch = false;
        }
        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "games",
                    localField: "gameId",
                    foreignField: "_id",
                    as: "gameId",
                    pipeline: [
                        { $project: { _id: 1, name: 1 } }
                    ]
                },
            },
            { $unwind: { path: "$gameId", preserveNullAndEmptyArrays: true } },
            { $addFields: { gameId: { $ifNull: ["$gameId", null] } } },
            ...(search ? [{ $match: { "gameId.name": { $regex: search, $options: "i" } } }] : []),
            {
                $lookup: {
                    from: "subgames",
                    localField: "subGameId",
                    foreignField: "_id",
                    as: "subGameId",
                    pipeline: [
                        { $project: { _id: 1, price: 1, entry: 1, network: 1, currency: 1, imgUrl: 1 } }
                    ]
                },
            },
            { $unwind: { path: "$subGameId", preserveNullAndEmptyArrays: true } },
            { $addFields: { subGameId: { $ifNull: ["$subGameId", null] } } },

            ...(filterObj?.currency ? [{ $match: { "subGameId.currency": filterObj.currency } }] : []),

            {
                $lookup: {
                    from: "users",
                    localField: "playerId",
                    foreignField: "_id",
                    as: "playerId",
                    pipeline: [
                        { $project: { _id: 1, name: 1, avatarUrl: 1 } }
                    ]
                },
            },
            { $unwind: { path: "$playerId", preserveNullAndEmptyArrays: true } },
            { $addFields: { playerId: { $ifNull: ["$playerId", null] } } },

            {
                $lookup: {
                    from: "users",
                    localField: "opponentId",
                    foreignField: "_id",
                    as: "opponentId",
                    pipeline: [
                        { $project: { _id: 1, name: 1, avatarUrl: 1 } }
                    ]
                },
            },
            { $unwind: { path: "$opponentId", preserveNullAndEmptyArrays: true } },
            { $addFields: { opponentId: { $ifNull: ["$opponentId", null] } } },

            {
                $lookup: {
                    from: "bots",
                    localField: "botId",
                    foreignField: "_id",
                    as: "botId",
                    pipeline: [
                        { $project: { _id: 1, name: 1, avatarUrl: 1 } }
                    ]
                },
            },
            { $unwind: { path: "$botId", preserveNullAndEmptyArrays: true } },
            { $addFields: { botId: { $ifNull: ["$botId", null] } } },

            {
                $lookup: {
                    from: "groups",
                    localField: "groupId",
                    foreignField: "_id",
                    as: "groupId",
                    pipeline: [
                        { $project: { _id: 1, groupName: 1, type: 1 } }
                    ]
                },
            },
            { $unwind: { path: "$groupId", preserveNullAndEmptyArrays: true } },
            { $addFields: { groupId: { $ifNull: ["$groupId", null] } } },

            { $sort: { _id: sort } },

        ];

        if (!isExport) {
            pipeline.push({ $skip: skip }, { $limit: limit },)
        }
        const history = await GameResult.aggregate(pipeline);
        if (isExport) {
            const headersMap = {
                "Game Name": "Game Name",
                "Winning Price": "Winning Price",
                "Entry Fee": "Entry Fee",
                "Network": "Network",
                "Currency": "Currency",
                "Started At": "Started At",
                "Winner": "Winner",
                "Winner Score": "Winner Score",
                "Loser": "Loser",
                "Loser Score": "Loser Score",
                "Bot Match": "Bot Match"
            };

            const plainRecords = history.map((game: any) => {
                const isPlayerWinner = game.playerScore > (game.opponentScore ?? 0);
                const winnerName = isPlayerWinner ? game.playerId?.name || game.botId?.name : game.opponentId?.name || game.botId?.name;
                const loserName = isPlayerWinner ? game.opponentId?.name || game.botId?.name : game.playerId?.name || game.botId?.name;
                const winnerScore = isPlayerWinner ? game.playerScore : game.opponentScore;
                const loserScore = isPlayerWinner ? game.opponentScore : game.playerScore;

                return {
                    "Game Name": game.gameId?.name || "Unknown Game",
                    "Winning Price": game.subGameId?.price || 0,
                    "Entry Fee": game.subGameId?.entry || 0,
                    "Network": game.subGameId?.network || "",
                    "Currency": game.subGameId?.currency || "",
                    "Started At": dayjs(game.createdAt).format("YYYY-MM-DD HH:mm"),
                    "Winner": winnerName,
                    "Winner Score": winnerScore,
                    "Loser": loserName,
                    "Loser Score": loserScore,
                    "Bot Match": game.isBotMatch ? "Yes" : "No"
                };
            });

            const fileName = `game-history-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.csv`;
            await generateCSV(plainRecords, headersMap, fileName, res);
            return { status: true, code: 200, data: "CSV file downloaded successfully" };
        }

        const countPipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "subgames",
                    localField: "subGameId",
                    foreignField: "_id",
                    as: "subGameId",
                }
            },
            { $unwind: { path: "$subGameId", preserveNullAndEmptyArrays: true } },
            ...(filterObj?.currency ? [{ $match: { "subGameId.currency": filterObj.currency } }] : []),
            ...(search ? [{ $match: { "gameId.name": { $regex: search, $options: "i" } } }] : []),
            { $count: "total" }
        ];
        const countResult = await GameResult.aggregate(countPipeline);
        const count = countResult[0]?.total || 0;

        const data = history.map((game: any) => {
            const isPlayerWinner = game.playerScore > (game.opponentScore ?? 0);
            const winnerId = isPlayerWinner ? game.playerId?._id || game.botId?._id : game.opponentId?._id || game.botId?._id;
            const winnerName = isPlayerWinner ? game.playerId?.name || game.botId?.name : game.opponentId?.name || game.botId?.name;
            const winnerAvatar = isPlayerWinner ? game.playerId?.avatarUrl || game.botId?.avatarUrl : game.opponentId?.avatarUrl || game.botId?.avatarUrl;
            const winnerScore = isPlayerWinner ? game.playerScore : game.opponentScore;
            const winnerIsBot = !!(isPlayerWinner ? game.botId && game.playerId == null : game.botId && game.opponentId == null);

            const loserId = isPlayerWinner ? game.opponentId?._id || game.botId?._id : game.playerId?._id || game.botId?._id;
            const loserName = isPlayerWinner ? game.opponentId?.name || game.botId?.name : game.playerId?.name || game.botId?.name;
            const loserAvatar = isPlayerWinner ? game.opponentId?.avatarUrl || game.botId?.avatarUrl : game.playerId?.avatarUrl || game.botId?.avatarUrl;
            const loserScore = isPlayerWinner ? game.opponentScore : game.playerScore;
            const loserIsBot = !!(isPlayerWinner ? game.botId && game.opponentId == null : game.botId && game.playerId == null);

            return {
                gameHistoryId: game._id,
                gameId: game.gameId?._id || null,
                gameName: game.gameId?.name || "Unknown Game",
                entryAmount: game.subGameId?.entry || 0,
                winnerPrice: game.subGameId?.price || 0,
                network: game.subGameId?.network || "",
                currency: game.subGameId?.currency || "",
                createdAt: game.createdAt,
                isBotPlayed: game.isBotMatch,
                status: game.status || "",
                group: game.groupId ? {
                    _id: game.groupId._id,
                    name: game.groupId.groupName,
                    type: game.groupId.type,
                } : null,
                winner: {
                    id: winnerId,
                    name: winnerName || "",
                    avatarUrl: winnerAvatar || "",
                    score: winnerScore,
                    isBot: winnerIsBot,
                },
                loser: {
                    id: loserId,
                    name: loserName || "",
                    avatarUrl: loserAvatar || "",
                    score: loserScore,
                    isBot: loserIsBot,
                },
                player: game.playerId ? {
                    _id: game.playerId._id,
                    name: game.playerId.name,
                    avatarUrl: game.playerId.avatarUrl,
                } : null,
                opponent: game.opponentId ? {
                    _id: game.opponentId._id,
                    name: game.opponentId.name,
                    avatarUrl: game.opponentId.avatarUrl,
                } : null,
                bot: game.botId ? {
                    _id: game.botId._id,
                    name: game.botId.name,
                    avatarUrl: game.botId.avatarUrl,
                } : null,
            };
        });

        return { data, count };
    }
}