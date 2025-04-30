import { Schema } from "mongoose";
import { leaderboardRepository } from "../repositories/leaderboard.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";

export class LeaderboardServices {

    constructor(private leaderboard: leaderboardRepository = new leaderboardRepository()) { }

    async getLeaderBoardByGameId(userId: any, gameId:Schema.Types.ObjectId) {
        const leaderboard = await this.leaderboard.getAllInGameCoinleaderboard(userId, gameId);
        if (leaderboard?.data.length === 0) throw new CustomError("No leaderboard found", HTTP_STATUS.NOT_FOUND);
        return leaderboard;
    }
}